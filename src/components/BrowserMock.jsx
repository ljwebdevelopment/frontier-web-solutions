import { CalendarCheck, Lock, Smartphone, Star } from 'lucide-react';

// Decorative mockup of a client website shown in the hero.
export default function BrowserMock() {
  return (
    <div className="mock" aria-hidden="true">
      <div className="mock__window">
        <div className="mock__bar">
          <span /><span /><span />
          <div className="mock__url"><Lock size={11} /> yourbusiness.com</div>
        </div>
        <div className="mock__screen">
          <div className="mock__nav">
            <div className="mock__logo" />
            <div className="mock__links"><i /><i /><i /></div>
            <div className="mock__pill" />
          </div>
          <div className="mock__hero">
            <div className="mock__text">
              <div className="mock__line mock__line--xl" />
              <div className="mock__line mock__line--lg" />
              <div className="mock__line mock__line--sm" />
              <div className="mock__line mock__line--sm mock__line--short" />
              <div className="mock__btns"><b /><b /></div>
            </div>
            <div className="mock__image" />
          </div>
          <div className="mock__cards">
            <div /><div /><div />
          </div>
        </div>
      </div>

      <div className="mock__float mock__float--a">
        <CalendarCheck size={18} />
        <div><strong>New booking</strong><span>Tomorrow, 10:00 AM</span></div>
      </div>
      <div className="mock__float mock__float--b">
        <div className="mock__stars">{[0, 1, 2, 3, 4].map((i) => <Star key={i} size={13} fill="currentColor" />)}</div>
        <span><strong>New 5-star review</strong></span>
      </div>
      <div className="mock__float mock__float--c">
        <Smartphone size={18} />
        <div><strong>Mobile ready</strong><span>Every screen size</span></div>
      </div>
    </div>
  );
}
