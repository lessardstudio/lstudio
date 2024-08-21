
import './style.css';
import ModelComponent from '../3dmodels/modelMoon';

const MainPage: React.FC = () => {

return (
    <div className="mainpage h-full w-full relative ">

        <div className="container justify-center items-center flex">
            <div className="header justify-center items-center flex h-screen w-screen select-none z-10">
                <div className="logotext">lessardstudio</div>
            </div>
        </div>
        <div className="absolute z-0 h-screen w-screen top-0">
            <ModelComponent/>
        </div>
    </div>
  );
};

export default MainPage;
