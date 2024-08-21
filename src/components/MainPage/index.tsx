
import './style.css';
import ModelComponent from '../3dmodels/modelMoon';

const MainPage: React.FC = () => {
    const handleRedirect = () => {
        window.location.href = 'https://t.me/lessrd';
    };

    
    return (
        <div className="mainpage h-full w-full relative ">

            <div className="container justify-center items-center flex">
                <div className="header justify-center items-center flex flex-col h-screen w-screen select-none z-10">
                    <div className="logotext">lessardstudio</div>
                    <div className="flex justify-center discription text-xs">contact us -
                        <div className="tg" onClick={handleRedirect} >t.me/lessrd</div>
                    </div>
                </div>
            </div>
            <div className="absolute z-0 h-screen w-screen top-0">
                <ModelComponent/>
            </div>
        </div>
    );
};

export default MainPage;
