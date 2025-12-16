import React, { useRef, useEffect, useState } from 'react';

const VideoBackground = () => {
  const videoRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      const handleCanPlay = () => {
        setIsLoaded(true);
        video.play().catch((error) => {
          console.log('Video autoplay prevented:', error);
        });
      };

      video.addEventListener('canplay', handleCanPlay);
      
      // Fallback: try to play after load
      if (video.readyState >= 3) {
        handleCanPlay();
      }

      return () => {
        video.removeEventListener('canplay', handleCanPlay);
      };
    }
  }, []);

  return (
    <div className="video-background">
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className={`background-video ${isLoaded ? 'loaded' : ''}`}
      >
        <source
          src="https://cdn.dribbble.com/userupload/45192765/file/ab7cdbc164cd673f334efc355c5cbe33.mp4"
          type="video/mp4"
        />
        Your browser does not support the video tag.
      </video>
      <div className="video-overlay"></div>
      {!isLoaded && (
        <div className="video-loading">
          <div className="loading-spinner"></div>
        </div>
      )}
    </div>
  );
};

export default VideoBackground;

