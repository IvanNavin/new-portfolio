import { useHouseContext } from "@app/utils/hooks/useHouseContext";
import { Button, Group, Modal, TextInput } from "@mantine/core";
import { Calendar } from "@mantine/dates";
import dayjs from "dayjs";
import { useEffect, useRef } from "react";

export function AddApartmentModal() {
  const {
    isModalOpen,
    setIsModalOpen,
    handleAddApartment,
    newApartmentName,
    setNewApartmentName,
    firstCleaningDate,
    setFirstCleaningDate,
    dates,
    isApartmentLoading,
  } = useHouseContext();
  const isDisabled =
    isApartmentLoading || newApartmentName.length === 0 || !firstCleaningDate;
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => ref.current?.focus(), 100);
  }, [ref.current]);

  return (
    <Modal
      opened={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      title="Wohnung hinzufügen"
    >
      <div className="flex flex-col items-center gap-y-4">
        <TextInput
          ref={ref}
          placeholder="Wohnungsname"
          value={newApartmentName}
          onChange={(e) => setNewApartmentName(e.target.value)}
        />
        <h2>Start der Reinigung</h2>
        <Calendar
          date={firstCleaningDate || new Date()}
          excludeDate={(date) =>
            date.getDay() !== 1 || dates.some((d) => dayjs(date).isSame(d))
          }
          onDateChange={setFirstCleaningDate}
          highlightToday
          withCellSpacing={false}
          renderDay={(day) => {
            const isActive =
              firstCleaningDate && dayjs(day).isSame(firstCleaningDate, "date");
            return (
              <div
                className="rounded-full size-full flex items-center justify-center"
                style={{
                  backgroundColor: isActive ? "#06f" : "transparent",
                  color: isActive ? "white" : "inherit",
                }}
                onClick={() => setFirstCleaningDate(day)}
              >
                {dayjs(day).date()}
              </div>
            );
          }}
        />
        <Group mt="md">
          <Button onClick={handleAddApartment} disabled={isDisabled}>
            Hinzufügen
          </Button>
        </Group>
      </div>
    </Modal>
  );
}
