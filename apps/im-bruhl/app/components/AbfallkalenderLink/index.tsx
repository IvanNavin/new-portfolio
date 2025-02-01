import { Flex } from "@mantine/core";
import { Link } from "@phosphor-icons/react";

export const AbfallKalenderLink = () => {
  return (
    <Flex gap={8} align="center">
      <Link size={32} />
      <section>
        <p className="text-lg font-semibold">Abfallkalender</p>
        <p className="text-sm text-gray-700">
          Hier können Sie den Abfallkalender einsehen:
          <a
            href="https://www.lrasbk.de/Direkt-zu/Abfallkalender/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline ml-1"
          >
            Abfallkalender anzeigen
          </a>
        </p>
      </section>
    </Flex>
  );
};
