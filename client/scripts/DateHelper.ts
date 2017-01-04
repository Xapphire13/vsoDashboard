export function toRelativeDate(date: Date): string {
  const oneMinute = 1000 * 60;
  const oneHour = oneMinute * 60;
  const oneDay = oneHour * 24;
  const oneWeek = oneDay * 7;
  const oneYear = oneWeek * 52;

  let difference = Date.now() - date.valueOf();

  if(difference >= 0) {
    if(difference < oneMinute) {
      return "just now"
    } else if (difference < oneHour) {
      let minutes = Math.floor(difference/oneMinute);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
    } else if (difference < oneDay) {
      let hours = Math.floor(difference/oneHour);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`
    } else if(difference < oneWeek) {
      let days = Math.floor(difference/oneDay);
      return `${days} day${days > 1 ? 's' : ''} ago`
    } else if(difference < oneYear) {
      let weeks = Math.floor(difference/oneWeek);
      return `${weeks} week${weeks > 1 ? 's' : ''} ago`
    }
  }

  return toDateString(date);
}

export function toDateString(date: Date): string {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  let padNumber = (val: number) => {
    let str = val.toString();

    return str.length < 2 ? `0${str}` : str;
  }

  return `${months[date.getMonth()]}-${padNumber(date.getDate())}-${date.getFullYear()} ${padNumber(date.getHours())}:${padNumber(date.getMinutes())}`;
}
