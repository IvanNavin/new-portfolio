"use client";
import { AbfallKalenderLink } from "@app/components/AbfallkalenderLink";
import { AccessComponent } from "@app/components/AccessComponent";
import { AddApartmentModal } from "@app/components/AddApartmentModal";
import { ApartmentList } from "@app/components/ApartmentList";
import { CleaningCalendar } from "@app/components/CleaningCalendar";
import { PrintSchedule } from "@app/components/PrintSchedule";
import { HouseContext } from "@app/context";
import { ApartmentListType } from "@app/types";
import { useHouse } from "@app/utils/hooks/useHouse";

type Props = {
  apartmentList: ApartmentListType;
};

export const HousePage = ({ apartmentList }: Props) => {
  const ctx = useHouse(apartmentList);
  const { apartments, currentApartment, isModalOpen } = ctx;

  return (
    <HouseContext.Provider value={ctx}>
      <main className="p-6 flex flex-col gap-y-6 items-center mb-[100px] relative">
        <div className="print-hide flex flex-col gap-y-6 items-center">
          <h1 className="text-5xl text-center text-black">Reinigungsplan</h1>
          <AccessComponent />

          {/* Apartments List */}
          <ApartmentList />

          <div className="underline text-black">
            Current apartment: {currentApartment?.name}
          </div>

          {/* Calendar */}
          <h2 className="text-2xl text-black">Dienstkalender</h2>
          <CleaningCalendar />

          {/* Modal for adding apartments */}
          {isModalOpen && <AddApartmentModal />}
        </div>

        <PrintSchedule apartments={apartments} />

        <AbfallKalenderLink />
      </main>
    </HouseContext.Provider>
  );
};
