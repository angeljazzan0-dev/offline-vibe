import * as FileSystem from 'expo-file-system';
import * as Linking from 'expo-linking';
import * as DocumentPicker from 'expo-document-picker';
import { Alert } from 'react-native';
import { database } from '../database';
import Track from '../database/models/Track';

export interface TelegramIncomingFile {
  originalFilename: string;
  sourceUri: string;
}

// 1. LISTENER AUTOMÁTICO (Para Telegram, WhatsApp o "Compartir con")
export function setupTelegramShareListener(onTrackIngested: (track: Track) => void): () => void {
  const handleUrl = async (url: string | null) => {
    if (!url) return;

    // DEBUG: Verás este popup en tu iPhone si iOS le entregó el archivo correctamente a la app
    Alert.alert('Ruta detectada', url);

    let filename = '';
    // IMPORTANTE: Mantenemos la URL original (con %20) para que FileSystem la encuentre
    let sourceUri = url; 

    // CASO A: Archivo compartido nativamente por iOS (file://...)
    if (url.startsWith('file://')) {
      const decodedUrl = decodeURI(url);
      filename = decodedUrl.split('/').pop() || `audio_${Date.now()}.mp3`;
    } 
    // CASO B: Deep link de OfflineVibe
    else {
      const decodedUrl = decodeURI(url);
      const parsed = Linking.parse(decodedUrl);
      if (parsed.scheme === 'offlinevibe' && parsed.hostname === 'import') {
        filename = (parsed.queryParams?.filename as string) || `telegram_${Date.now()}.mp3`;
        sourceUri = (parsed.queryParams?.sourceUri as string) || url;
      }
    }

    if (sourceUri) {
      console.log('Ingestando archivo desde:', sourceUri);
      const track = await ingestTelegramAudio({ originalFilename: filename, sourceUri });
      if (track) {
        onTrackIngested(track);
        Alert.alert('¡Éxito!', `Pista añadida: ${filename}`);
      }
    }
  };

  // Escuchar cuando la app ya está abierta de fondo
  const subscription = Linking.addEventListener('url', ({ url }) => {
    handleUrl(url);
  });

  // Escuchar cuando la app estaba cerrada (arranque en frío)
  Linking.getInitialURL().then(handleUrl);

  return () => subscription.remove();
}

// 2. BOTÓN MANUAL (Abre la app nativa "Archivos" de iOS)
export async function pickAndImportAudio(onTrackIngested: (track: Track) => void) {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-m4a', 'audio/*'],
      copyToCacheDirectory: false, 
      multiple: true,
    });

    if (result.canceled || !result.assets) return;

    let importedCount = 0;
    for (const asset of result.assets) {
      const track = await ingestTelegramAudio({
        originalFilename: asset.name,
        sourceUri: asset.uri
      });
      if (track) {
        onTrackIngested(track);
        importedCount++;
      }
    }
    
    Alert.alert('Importación completada', `${importedCount} pista(s) añadida(s) a la biblioteca.`);
  } catch (err) {
    console.error('Error seleccionando documentos:', err);
    Alert.alert('Error', 'No se pudo importar la música.');
  }
}

// 3. MOTOR DE INGESTA ORIGINAL (Intacto)
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
