export default function TailwindColorTest() {
    return (
      <div className="min-h-screen p-6 space-y-4 bg-background text-text">
        <div className="bg-primary text-white p-4 rounded">
          Primary bg (dark)
        </div>
  
        <div className="bg-accent text-white p-4 rounded">
          Accent bg (blue)
        </div>
  
        <div className="border border-border-subtle p-4 rounded">
          Border subtle
        </div>
  
        <button
          className="bg-primary text-white hover:bg-primary-hover px-4 py-2 rounded focus:outline-none focus:ring-4 focus:ring-[rgba(37,99,235,0.12)]"
          type="button"
        >
          Primary button
        </button>
  
        <a
          className="block text-accent hover:text-accent-hover focus:outline-none focus:ring-4 focus:ring-[rgba(37,99,235,0.12)]"
          href="#"
        >
          Accent link
        </a>
  
        <div className="bg-neutral-1 text-neutral-2 p-4 rounded">
          Neutral test
        </div>
      </div>
    );
  }
  