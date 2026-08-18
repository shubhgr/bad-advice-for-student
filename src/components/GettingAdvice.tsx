"use client";

interface GettingAdviceProps {
  message?: string;
  subcopy?: string;
  softEnter?: boolean;
}

export default function GettingAdvice({
  message = "Okay... let's ruin your life.",
  subcopy,
  softEnter = false,
}: GettingAdviceProps) {
  return (
    <div
      className={`getting-advice-screen ${softEnter ? "animate-advice-in" : "animate-fade-in"}`}
    >
      <div className="getting-advice-visual">
        <div className="getting-advice-chakra-wrap" aria-hidden="true">
          <img
            src="/images/chakra.png"
            alt=""
            className="getting-advice-chakra"
          />
        </div>
        <div className="getting-advice-monk-wrap">
          <img
            src="/images/monk-transparent.png"
            alt="Meditating monk"
            className="getting-advice-monk"
          />
        </div>
      </div>

      <div className="getting-advice-copy">
        <p className="getting-advice-message">{message}</p>
        {subcopy ? <p className="getting-advice-subcopy">{subcopy}</p> : null}
      </div>
    </div>
  );
}
