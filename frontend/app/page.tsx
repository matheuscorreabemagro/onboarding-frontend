import MapComponent from './components/MapComponent';
import FileUpload from './components/FileUpload';
import Toolbar from './components/Toolbar';

export default function Home() {
  return (
    <main>
      <Toolbar />
      <FileUpload />
      <MapComponent />
    </main>
  );
}
