import { generateColor } from "@app/utils/generateColor";
import { getApartmentForDay } from "@app/utils/getApartmentForDay";
import { useHouseContext } from "@app/utils/hooks/useHouseContext";
import { Tooltip } from "@mantine/core";
import { Calendar } from "@mantine/dates";
import dayjs from "dayjs";

export function CleaningCalendar() {
  const { apartments, selectedDate, setSelectedDate } = useHouseContext();

  return (
    <Calendar
      date={selectedDate}
      onDateChange={setSelectedDate}
      size="lg"
      minDate={new Date(2024, 11, 2)}
      renderDay={(day) => {
        const apartment = getApartmentForDay(apartments, day);
        const today = dayjs().isSame(day, "date");

        const backgroundColor = apartment
          ? generateColor(apartments.findIndex((a) => a.id === apartment.id))
          : "transparent";

        return (
          <Tooltip.Floating
            label={
              <span className="text-black">{apartment?.name || "No name"}</span>
            }
            color="white"
            className="border border-gray-300 rounded-lg"
          >
            <div
              className="flex size-full rounded-full justify-center items-center "
              style={{
                backgroundColor: today ? "#06f" : backgroundColor,
                color: today ? "white" : "#000",
              }}
            >
              {dayjs(day).date()}
            </div>
          </Tooltip.Floating>
        );
      }}
    />
  );
}
