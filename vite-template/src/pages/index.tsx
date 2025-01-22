import { useState, useEffect } from "react";
import axios from "axios";

import CardWithImages from "@/components/cardWithImages";
import DefaultLayout from "@/layouts/default";

interface IImages {
  name: string;
  image: string;
}

const API_URL = "http://localhost:8080/image/";

const IndexPage: React.FC = () => {
  const [namesList, setNamesList] = useState<string[]>([]);
  const [imagesList, setImagesList] = useState<IImages[]>([]);

  useEffect(() => {
    fetchNames();
  }, []);

  const fetchNames = async () => {
    try {
      const response = await axios.get(`${API_URL}names`);
      const data: Record<string, string> = response.data;

      setNamesList(Object.values(data));
    } catch (error) {
      console.error("Error fetching names:", error);
    }
  };

  const fetchImages = async () => {
    if (namesList.length > 0) {
      try {
        const responses = await Promise.all(
          namesList.map((name) =>
            axios.get(`${API_URL}${name}`, { responseType: "blob" }),
          ),
        );

        const images = responses.map((response, index) => ({
          name: namesList[index],
          image: URL.createObjectURL(response.data),
        }));

        setImagesList(images);
      } catch (error) {
        console.error("Error fetching images:", error);
      }
    }
  };

  useEffect(() => {
    fetchImages();

    return () => {
      imagesList.forEach(({ image }) => URL.revokeObjectURL(image));
    };
  }, [namesList]);

  return (
    <DefaultLayout>
      <CardWithImages list={imagesList} />
    </DefaultLayout>
  );
};

export default IndexPage;
