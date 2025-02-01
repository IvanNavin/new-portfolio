import { DeleteApartmentModal } from "@app/components/DeleteApartmentModal";
import { EditApartmentModal } from "@app/components/EditApartmentModal";
import { ApartmentType } from "@app/types";
import { generateColor } from "@app/utils/generateColor";
import { useHouseContext } from "@app/utils/hooks/useHouseContext";
import { Button, Flex, Menu, Modal } from "@mantine/core";
import { Plus } from "@phosphor-icons/react";
import { clsxm } from "@repo/utils";
import { useState } from "react";

export function ApartmentList() {
  const [modalState, setModalState] = useState<"edit" | "delete" | "">("");
  const [selectedApartment, setSelectedApartment] =
    useState<ApartmentType | null>(null);
  const { apartments, setIsModalOpen, hasAccess } = useHouseContext();
  const isOpened = modalState === "edit" || modalState === "delete";

  const onEdit = (apartment: ApartmentType) => {
    setSelectedApartment(apartment);
    setModalState("edit");
  };
  const onDelete = (apartment: ApartmentType) => {
    setSelectedApartment(apartment);
    setModalState("delete");
  };
  const onClose = () => {
    setSelectedApartment(null);
    setModalState("");
  };

  return (
    <div className="rounded-lg border border-gray-300 p-4 w-full max-w-[1000px]">
      <Flex justify="space-between" align="center">
        <h2 className="text-black">Wohnungen</h2>
        {hasAccess && (
          <Button
            onClick={() => setIsModalOpen(true)}
            variant="outline"
            leftSection={<Plus />}
            radius={100}
            size="sm"
          >
            Wohnung hinzufügen
          </Button>
        )}
      </Flex>

      <ul className="flex gap-4 my-4 flex-wrap justify-center">
        {apartments
          .filter((a) => !a.endDate)
          .map((apartment, idx) => (
            <li key={apartment.id}>
              <Menu shadow="md" width={100} disabled={!hasAccess}>
                <Menu.Target>
                  <div
                    className={clsxm(
                      "px-2 border border-gray-300 rounded-full text-black",
                      "flex justify-center items-center gap-1 cursor-default",
                      hasAccess && "cursor-pointer",
                    )}
                  >
                    <div
                      className="size-3 rounded-full"
                      style={{ backgroundColor: generateColor(idx) }}
                    />
                    <span>{apartment.name}</span>
                  </div>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item onClick={() => onEdit(apartment)}>Edit</Menu.Item>
                  <Menu.Item onClick={() => onDelete(apartment)}>
                    Delete
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </li>
          ))}
      </ul>

      {selectedApartment && (
        <Modal opened={isOpened} onClose={onClose}>
          {modalState === "edit" ? (
            <EditApartmentModal
              apartment={selectedApartment}
              onClose={onClose}
            />
          ) : (
            <DeleteApartmentModal
              apartment={selectedApartment}
              onClose={onClose}
            />
          )}
        </Modal>
      )}
    </div>
  );
}
