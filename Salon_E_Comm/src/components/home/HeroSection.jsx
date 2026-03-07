import React from 'react';
import { Button } from '../ui/button';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/autoplay';
import 'swiper/css/effect-fade';

const HeroSection = ({ navigate }) => (
    <section className="relative w-full pb-4 md:pb-0 md:h-[350px] overflow-hidden">
        <img src="/bg/b4.png" alt="bg" className='absolute w-full h-full object-cover' />

        <div className="max-w-7xl mx-auto lg:px-8 h-full flex items-center relative z-20">
            <div className="grid grid-cols-1 md:grid-cols-2 w-full gap-2 md:gap-8 items-center">

                <div className="px-4 sm:px-6 space-y-6 animate-in fade-in slide-in-from-left duration-700 relative z-20 text-center md:text-left flex flex-col items-center md:items-start order-2 md:order-1">
                    <div>
                        <h1 className="text-5xl lg:text-6xl font-bold text-foreground">
                            Premium beauty{" "}
                            <span className="text-primary">Products.</span>
                        </h1>
                        <p className="text-foreground-secondary text-sm md:text-lg capitalize font-medium max-w-md mt-2 drop-shadow-sm mx-auto md:mx-0">
                            natural & Salon Quality.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 max-w-md w-full justify-center md:justify-start">
                        <Button
                            size="lg"
                            className="rounded-md px-10 font-bold text-lg shadow-foreground-muted shadow-md bg-primary text-secondary transition-colors duration-300 hover:bg-primary-hover"
                            onClick={() => navigate('/products')}
                        >
                            Shop Now
                        </Button>
                    </div>
                </div>

                <div className="overflow-hidden z-0 order-1 md:order-2 w-full  aspect-video md:aspect-auto md:h-[350px]">
                    <Swiper
                        modules={[Autoplay, EffectFade]}
                        effect="fade"
                        autoplay={{ delay: 5000, disableOnInteraction: false }}
                        loop={true}
                        className="w-full h-full"
                    >
                        {[
                            "https://orchidlifesciences.com/wp-content/uploads/2024/06/01-14-01-1024x704.jpg",
                            "https://images.unsplash.com/photo-1625753783470-ec2ab4efeeec?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fGJlYXV0eSUyMHByb2R1Y3RzfGVufDB8fDB8fHww",
                            "https://images.unsplash.com/photo-1631390179406-0bfe17e9f89d?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fGJlYXV0eSUyMHByb2R1Y3RzfGVufDB8fDB8fHww"
                        ].map((img, idx) => (
                            <SwiperSlide key={idx}>
                                <img
                                    src={img}
                                    alt={`Slide ${idx + 1}`}
                                    className="w-full h-full object-cover object-center transition-opacity duration-1000"
                                />
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>

            </div>
        </div>
    </section>
);

export default HeroSection;
