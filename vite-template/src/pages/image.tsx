import { useState, useEffect } from "react";
import { Image, Spinner } from "@heroui/react";
import axios from "axios";

import DefaultLayout from "@/layouts/default";

const API_URL = "http://localhost:8080/image/";

async function fetchImage(name: string): Promise<string | null> {
  try {
    const response = await axios.get(`${API_URL}${name}`, {
      responseType: "blob",
    });

    return URL.createObjectURL(response.data);
  } catch (error) {
    console.error("Error fetching image:", error);

    return null;
  }
}

export default function ImagePage() {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadImage = async () => {
      const imageUrl = await fetchImage("random");

      if (imageUrl) {
        setImage(imageUrl);
      } else {
        setError("Failed to load image.");
      }
      setLoading(false);
    };

    setLoading(true);

    loadImage();

    return () => {
      if (image) {
        URL.revokeObjectURL(image);
      }
    };
  }, []);

  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
        {loading ? (
          <Spinner color="secondary" label="Loading..." size="lg" />
        ) : error ? (
          <p>{error}</p>
        ) : (
          <Image
            className="w-full object-cover"
            radius="lg"
            shadow="sm"
            src={image || ""}
            width="100%"
          />
        )}
      </section>
    </DefaultLayout>
  );
}
