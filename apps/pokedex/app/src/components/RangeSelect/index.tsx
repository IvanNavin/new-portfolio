import { Button, Popover, RangeSlider } from '@mantine/core';
import { useState } from 'react';

type Props = {
  label: string;
  value: [number, number];
  onChange: (value: [number, number]) => void;
};

export default function RangeSelect({
  label,
  value = [0, 100],
  onChange,
}: Props) {
  const [opened, setOpened] = useState(false);
  // const [range, setRange] = useState<[number, number]>();

  return (
    <Popover
      opened={opened}
      onChange={setOpened}
      width={300}
      position='bottom'
      withArrow
      shadow='md'
    >
      <Popover.Target>
        <Button variant='light' onClick={() => setOpened((o) => !o)}>
          {`${label} range: ${value[0]} - ${value[1]}`}
        </Button>
      </Popover.Target>
      <Popover.Dropdown>
        <RangeSlider value={value} onChange={onChange} min={0} max={100} />
      </Popover.Dropdown>
    </Popover>
  );
}
