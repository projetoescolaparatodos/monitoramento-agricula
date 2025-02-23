import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: "di3lqsxxc", // Substitua pelo seu cloud name
  api_key: "137494886285615", // Substitua pela sua API key
  api_secret: "<your_api_secret>", // Substitua pela sua API secret
});

export default cloudinary;