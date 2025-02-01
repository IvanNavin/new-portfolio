import { updateApartment } from "@app/apis/updateApartment";
import { ApartmentType } from "@app/types";
import { useHouseContext } from "@app/utils/hooks/useHouseContext";
import { Button, Flex } from "@mantine/core";
import { Warning } from "@phosphor-icons/react";
import { useState } from "react";

type Props = {
  apartment: ApartmentType;
  onClose: () => void;
};

export const DeleteApartmentModal = ({ apartment, onClose }: Props) => {
  const [loading, setLoading] = useState(false);
  const { updateApartmentList } = useHouseContext();

  const onClick = async () => {
    setLoading(true);

    await updateApartment({ ...apartment, endDate: new Date() })
      .then(async () => {
        await updateApartmentList();
      })
      .catch(() => {
        alert("Löschen der Wohnung fehlgeschlagen");
      })
      .finally(() => {
        setLoading(false);
      });

    onClose();
  };

  return (
    <Flex direction="column" align="center" gap={16}>
      <Warning size={36} color="#AE1B1B" />
      <p className="text-xl text-center font-bold leading-[30px] text-zinc-800">
        Bist du sicher, dass du die Wohnung löschen möchtest?
      </p>
      <p className="text-base text-center font-normal leading-normal text-zinc-800">
        Das Löschen der Wohnung wird sie dauerhaft entfernen.
      </p>
      <footer className="w-full pt-6 flex justify-end gap-4">
        <Button color="red" disabled={loading} onClick={onClick}>
          Löschen
        </Button>
        <Button color="blue" variant="outline" onClick={onClose}>
          Abbrechen
        </Button>
      </footer>
    </Flex>
  );
};
