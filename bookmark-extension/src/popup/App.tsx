import AppView from '../app/App';
import Modal from 'react-modal';
import { Toaster } from 'react-hot-toast';

Modal.setAppElement('#root'); // 모달 접근성 설정

function App() {
  return (
    <div>
      <Toaster />
      <AppView />
    </div>
  );
}

export default App;
