import { updateApartment } from "@app/apis/updateApartment";
import { ApartmentType } from "@app/types";
import { useHouseContext } from "@app/utils/hooks/useHouseContext";
import { Button, Flex, TextInput } from "@mantine/core";
import { useEffect, useRef, useState } from "react";

type Props = {
  apartment: ApartmentType;
  onClose: () => void;
};

export const EditApartmentModal = ({ apartment, onClose }: Props) => {
  const [value, setValue] = useState(apartment.name);
  const [loading, setLoading] = useState(false);
  const { updateApartmentList } = useHouseContext();
  const inputRef = useRef<HTMLInputElement>(null);
  const disabled = loading || !value || value === apartment.name;

  const onClick = async () => {
    setLoading(true);

    await updateApartment({ ...apartment, name: value })
      .then(() => {
        updateApartmentList();
      })
      .catch(() => {
        alert("Aktualisierung der Wohnung fehlgeschlagen");
      })
      .finally(() => {
        setLoading(false);
      });

    onClose();
  };

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  return (
    <Flex direction="column" align="center" gap={16}>
      <TextInput
        ref={inputRef}
        w="100%"
        label="Wohnungsname"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={async (event) => {
          if (event?.key === "Enter") {
            await onClick();
          }
        }}
      />
      <Flex justify="end" align="center" gap={16} w="100%">
        <Button color="blue" disabled={disabled} onClick={onClick}>
          Speichern
        </Button>
        <Button color="blue" variant="outline" onClick={onClose}>
          Abbrechen
        </Button>
      </Flex>
    </Flex>
  );
};
