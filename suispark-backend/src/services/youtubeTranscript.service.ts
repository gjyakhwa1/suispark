import { YoutubeTranscript } from 'youtube-transcript';
export const getYoutubeVideoTranscript = async videoLink => {
  try {
    if (videoLink.includes('youtube') || videoLink.includes('youtu.be')) {
      const transcript = await YoutubeTranscript.fetchTranscript(videoLink);
      const transcriptText = transcript.map(e => e.text).join(' ');
      return transcriptText;
    }
    console.log('Not a youtube link');
    return '';
  } catch (e) {
    console.log('could not transcribe the youtube video');
    return '';
  }
};
