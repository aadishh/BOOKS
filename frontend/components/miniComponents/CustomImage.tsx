import React from "react";

interface CustomImageProps {
    name: keyof typeof imagesMap;
    className?: string;
}

// Define your image map outside the component for better performance and typing
const imagesMap = {
    bookLogo: { src: "/svg/BookLogo.svg", alt: "Book Store Logo" },
    whiteFacebook: { src: "/svg/duplicateLogo/whiteFacebook.svg" },
    whiteLinkdin: { src: "/svg/duplicateLogo/whiteLinkdin.svg" },
    whiteTwitter: { src: "/svg/duplicateLogo/whiteTwitter.svg" },
    whiteYoutube: { src: "/svg/duplicateLogo/whiteYoutube.svg" },
  
    whiteBook: { src: "/images/whiteBook.png"},
} as const;

const CustomImage: React.FC<CustomImageProps> = ({ name, className }) => {
    const image = imagesMap[name];

    if (!image) {
        return <p>Image not found</p>;
    }

    return <img src={image.src} className={className} />;
};

export default CustomImage;
