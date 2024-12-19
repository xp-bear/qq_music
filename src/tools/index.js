export function animateJsMove(start, end, duration, element, property) {
  function easeInOutQuad(t, b, c, d) {
    t /= d / 2;
    if (t < 1) return (c / 2) * t * t + b;
    t--;
    return (-c / 2) * (t * (t - 2) - 1) + b;
  }
  let startTime = null;

  function step(timestamp) {
    if (!startTime) startTime = timestamp;
    const progress = timestamp - startTime;
    const val = easeInOutQuad(progress, start, end - start, duration);
    element.style = `${property}(${val}px)`;

    if (progress < duration) {
      requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);
}

//   // 使用示例：
//   const box = document.querySelector('.box'); // 假设你有一个class为'box'的元素
//   animate(0, 80, 2000, box, 'transform'); // 从0px移动到80px，持续时间为2秒
