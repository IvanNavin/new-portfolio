export const Borders = () => {
  return (
    <div className='pointer-events-none absolute inset-0 z-10'>
      <div className="absolute left-0 top-0 size-3 bg-[url('/assets/border-top-left.png')] bg-cover" />
      <div className="absolute inset-x-3 top-0 h-3 bg-[url('/assets/border-top.png')] bg-repeat-x" />
      <div className="absolute right-0 top-0 size-3 bg-[url('/assets/border-top-right.png')] bg-cover" />
      <div className="absolute inset-y-3 left-0 w-3 bg-[url('/assets/border-left.png')] bg-repeat-y" />
      <div className="absolute inset-y-3 right-0 w-3 bg-[url('/assets/border-right.png')] bg-repeat-y" />
      <div className="absolute bottom-0 left-0 size-3 bg-[url('/assets/border-bottom-left.png')] bg-cover" />
      <div className="absolute inset-x-3 bottom-0 h-3 bg-[url('/assets/border-bottom.png')] bg-repeat-x" />
      <div className="absolute bottom-0 right-0 size-3 bg-[url('/assets/border-bottom-right.png')] bg-cover" />
    </div>
  );
};
