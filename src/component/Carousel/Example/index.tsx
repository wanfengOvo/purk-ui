import React from 'react';
import Carousel from '../Carousel';

const CarouselExample: React.FC = () => {
    return (
        <div>
            <Carousel
                arrows={true}
                autoPlay={true}
                autoplaySpeed={3000}
                draggable={true}
                infinite={true}
                dots={true}
            >
                <div style={{ height: '400px', backgroundColor: '#ff6b6b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '24px' }}>
                    Slide 1
                </div>
                <div style={{ height: '400px', backgroundColor: '#4ecdc4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '24px' }}>
                    Slide 2
                </div>
                <div style={{ height: '400px', backgroundColor: '#45b7d1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '24px' }}>
                    Slide 3
                </div>
                <div style={{ height: '400px', backgroundColor: '#96ceb4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '24px' }}>
                    Slide 4
                </div>
                <div style={{ height: '400px', backgroundColor: '#feca57', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '24px' }}>
                    Slide 5
                </div>
            </Carousel>
        </div>
    );
};

export default CarouselExample;