import { ApartmentType } from "@app/types";
import { getApartmentForDay } from "@app/utils/getApartmentForDay";
import { DatesRangeValue, MonthPickerInput } from "@mantine/dates";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import { useState } from "react";

type Props = {
  apartments: ApartmentType[];
};

dayjs.extend(isoWeek);

export const PrintSchedule = ({ apartments }: Props) => {
  const [dateRange, setDateRange] = useState<DatesRangeValue>([null, null]);

  const handlePrint = () => {
    if (!dateRange[0] || !dateRange[1]) {
      alert("Bitte wählen Sie einen Datumsbereich!");
      return;
    }

    window.print();
  };

  const generateSchedule = () => {
    if (!dateRange[0] || !dateRange[1]) return [];
    const start = dayjs(dateRange[0]);
    const end = dayjs(dateRange[1]);

    const schedule = [];
    let currentDay = start;

    while (currentDay.isBefore(end) || currentDay.isSame(end, "day")) {
      const currentApartment = getApartmentForDay(
        apartments,
        currentDay.toDate(),
      );
      if (currentApartment) {
        schedule.push({
          date: `${currentDay.startOf("isoWeek").format("DD.MM.YYYY")} - ${currentDay.endOf("isoWeek").format("DD.MM.YYYY")}`,
          apartment: currentApartment.name,
        });
      }
      currentDay = currentDay.add(1, "week");
    }

    return schedule;
  };

  const schedule = generateSchedule();

  return (
    <>
      <div className="print-hide">
        <h2 className="text-2xl mb-4 text-black">Reinigungsplan drucken</h2>
        <MonthPickerInput
          label="Wählen Sie einen Datumsbereich"
          placeholder="Wählen Sie die Daten aus"
          type="range"
          value={dateRange}
          onChange={setDateRange}
          locale="de"
        />
        <button
          onClick={handlePrint}
          className="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        >
          Plan drucken
        </button>
      </div>

      {/* Block for printing */}
      <div className="printable w-full hidden print:block border">
        <h3 className="text-xl font-bold my-0.5 text-center">Reinigungsplan</h3>
        <table className="w-full border-collapse border border-gray-300 text-xs">
          <thead>
            <tr>
              <th className="border border-gray-300 p-0.5 px-4">Datum</th>
              <th className="border border-gray-300 p-0.5 px-4 w-full">
                Wohnung
              </th>
              <th className="border border-gray-300 py-0.5 px-2">
                Unterschrift
              </th>
            </tr>
          </thead>
          <tbody>
            {schedule.map((entry, index) => (
              <tr key={index}>
                <td className="border border-gray-300 p-0.5 whitespace-nowrap px-4">
                  {entry.date}
                </td>
                <td className="border border-gray-300 p-0.5 w-full px-4">
                  {entry.apartment}
                </td>
                <td className="border border-gray-300 p-0.5"></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};
