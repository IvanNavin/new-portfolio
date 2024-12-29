export const ProgressFacts = ({ value }: { value: number }) => {
  return (
    <div className='relative ml-auto h-1 w-[320px]'>
      <div
        className='absolute inset-y-0 right-0 z-10 h-1 bg-white'
        style={{ width: `${value}%` }}
      />
      <div
        className='absolute inset-0 z-20'
        style={{
          backgroundImage: `repeating-linear-gradient(45deg, #000 0px, #000 2px, transparent 2px, transparent 4px)`,
          backgroundSize: `4px 4px`,
          backgroundPosition: `0 0`,
        }}
      />
    </div>
  );
};
