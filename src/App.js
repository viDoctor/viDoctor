import './App.css';
import React from 'react';
import Video from './Video';

function App() {
  return (
    <div className="splitScreenVertical">
      <div className="upperScreen">
        <div className="text">
          viDoctor
        </div>
      </div>
      <div className="lowerScreen">
        <div className="leftScreen">
          <div className="text">
            Find Hospital
          </div>
        </div>
        <div className="rightScreen">
          <div className="text">
            <Video hName="test"></Video>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
