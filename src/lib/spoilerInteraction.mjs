// Hover is a preview, not consent to follow a concealed link.
export function handleSpoilerActivation(event) {
  if(event.type==='keydown' && !['Enter',' '].includes(event.key))return;
  const target=event.target;
  if(!target?.closest || target.closest('[contenteditable="true"]'))return;
  const spoiler=target.closest('.wiki-spoiler');
  if(!spoiler)return;
  const revealed=spoiler.classList.contains('is-revealed');
  const link=target.closest('a[href]');
  if(revealed && link)return;
  event.preventDefault();
  event.stopImmediatePropagation();
  if(event.repeat)return;
  spoiler.classList.toggle('is-revealed',!revealed);
  spoiler.setAttribute('aria-expanded',String(!revealed));
}
