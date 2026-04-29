let activeLoads = 0;
const MAX_ACTIVE = 4;
const queue = []; 
export function requestSlot(cb) {
  if (activeLoads < MAX_ACTIVE) {
    activeLoads++;
    cb();
  } else {
    queue.push(cb);
  }
}

export function releaseSlot() {
  activeLoads = Math.max(0, activeLoads - 1);
  if (queue.length > 0) {
    const next = queue.shift();
    activeLoads++;
    next();
}
}

