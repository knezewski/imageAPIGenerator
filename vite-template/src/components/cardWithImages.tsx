import { Card, CardFooter, CardBody, Image } from "@heroui/react";
import axios from "axios";

interface ICardWithImages {
  name: string;
  image: string;
}
const CardWithImages = ({ list }: { list: ICardWithImages[] | [] }) => {
  const handlePress = async (name: string) => {
    try {
      const res = await axios.get(`http://localhost:8080/new/${name}`);

      if (res.data.url) {
        window.open(res.data.url, "_blank", "noopener,noreferrer");
      } else {
        console.error("No URL found in the response.");
      }
    } catch (error) {
      console.error("Error fetching the URL:", error);
    }
  };

  return (
    <div className="gap-5 grid grid-cols-2 sm:grid-cols-4">
      {list.map(({ name, image }) => (
        <Card
          key={name}
          isPressable
          shadow="sm"
          onPress={() => handlePress(name)}
        >
          <CardBody className="overflow-visible p-0">
            <Image
              isZoomed
              className="w-full object-cover"
              radius="lg"
              shadow="sm"
              src={image}
              width="100%"
            />
          </CardBody>
          <CardFooter className="text-small justify-between">
            <b>{name}</b>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default CardWithImages;
