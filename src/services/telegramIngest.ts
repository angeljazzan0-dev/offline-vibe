import * as FileSystem from 'expo-file-system/legacy';
import * as Linking from 'expo-linking';
import { database } from '../database';
import Track from '../database/models/Track';

export interface TelegramIncomingFile {
  originalFilename: string;
  sourceUri: string;
}

export function setupTelegramShareListener(onTrackIngested: (track: Track) => void): () => void {
  const subscription = Linking.addEventListener('url', async ({ url }) => {
    const parsed = Linking.parse(url);
    if (parsed.scheme === 'offlinevibe' && parsed.hostname === 'import') {
      const filename = (parsed.queryParams?.filename as string) || `telegram_${Date.now()}.mp3`;
      const sourceUri = parsed.queryParams?.sourceUri as string;

      if (sourceUri) {
        const track = await ingestTelegramAudio({ originalFilename: filename, sourceUri });
        if (track) {
          onTrackIngested(track);
        }
      }
    }
  });

  return () => subscription.remove();
}

export async function ingestTelegramAudio(incoming: TelegramIncomingFile): Promise<Track | null> {
  try {
    const sanitizedFilename = incoming.originalFilename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const tracksDir = `${FileSystem.documentDirectory}tracks/`;
    const destinationUri = `${tracksDir}${Date.now()}_${sanitizedFilename}`;

    const dirInfo = await FileSystem.getInfoAsync(tracksDir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(tracksDir, { intermediates: true });
    }

    await FileSystem.copyAsync({
      from: incoming.sourceUri,
      to: destinationUri,
    });

    const fileInfo = await FileSystem.getInfoAsync(destinationUri);
    const fileSize = fileInfo.exists ? (fileInfo.size ?? 0) : 0;
    const parsedMeta = parseFilenameHeuristic(incoming.originalFilename);

    const track = await database.write(async () => {
      return await database.get<Track>('tracks').create((t) => {
        t.filename = incoming.originalFilename;
        t.filePath = destinationUri;
        t.fileSize = fileSize;
        t.duration = 180;
        t.title = parsedMeta.title;
        t.artist = parsedMeta.artist;
        t.artistId = parsedMeta.artistId;
        t.genre = 'Unclassified';
        t.energy = 5.0;
        t.genreWeight = 0.5;
        t.tempoBpm = 110;
        t.popularity = 0.5;
        t.moodTags = [];
        t.needsEnrichment = true;
        t.playCount = 0;
      });
    });

    return track;
  } catch (error) {
    console.error('[Ingestion] Error procesando archivo de Telegram:', error);
    return null;
  }
}

function parseFilenameHeuristic(filename: string): { title: string; artist: string; artistId: string } {
  const clean = filename.replace(/\.(mp3|m4a|wav|aac)$/i, '');
  const parts = clean.split(/\s*-\s*/);

  let artist = 'Unknown Artist';
  let title = clean;

  if (parts.length >= 2) {
    artist = parts[0].trim();
    title = parts.slice(1).join(' - ').trim();
  }

  const artistId = artist.toLowerCase().replace(/[^a-z0-9]/g, '_');
  return { title, artist, artistId };
}