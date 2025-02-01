import { useHouseContext } from "@app/utils/hooks/useHouseContext";
import { ActionIcon, Button, Modal, PasswordInput } from "@mantine/core";
import { Lock, LockOpen } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";

export const AccessComponent = () => {
  const [opened, setOpened] = useState(false);
  const [password, setPassword] = useState("");
  const { hasAccess, setHasAccess } = useHouseContext();
  const ref = useRef<HTMLInputElement>(null);

  const checkPassword = () => {
    if (password === process.env.NEXT_PUBLIC_ACCESS_PASSWORD) {
      setHasAccess("true");
      setOpened(false);
    } else {
      alert("Falsches Passwort");
    }
  };

  useEffect(() => {
    if (!opened) {
      setPassword("");
    }
    if (opened) {
      setTimeout(() => ref.current?.focus(), 100);
    }
  }, [opened]);

  return (
    <div className="absolute top-3 right-6 opacity-30 hover:opacity-100">
      <ActionIcon
        variant="subtle"
        onClick={() => {
          hasAccess ? setHasAccess("false") : setOpened(true);
        }}
      >
        {hasAccess ? <LockOpen size={32} /> : <Lock size={32} />}
      </ActionIcon>

      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title="Passwort eingeben"
        ref={ref}
      >
        <PasswordInput
          ref={ref}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Passwort"
        />
        <Button fullWidth mt="md" onClick={checkPassword}>
          Einloggen
        </Button>
      </Modal>
    </div>
  );
};
