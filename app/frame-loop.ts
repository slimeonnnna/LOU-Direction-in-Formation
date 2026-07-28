"use client";

type FrameTask = (time: number) => boolean;

const tasks = new Set<FrameTask>();
let frame: number | null = null;

const tick = (time: number) => {
  frame = null;
  let keepRunning = false;

  tasks.forEach((task) => {
    keepRunning = task(time) || keepRunning;
  });

  if (keepRunning && tasks.size > 0) {
    frame = window.requestAnimationFrame(tick);
  }
};

export const requestSharedFrame = () => {
  if (frame !== null || tasks.size === 0) return;
  frame = window.requestAnimationFrame(tick);
};

export const registerFrameTask = (task: FrameTask) => {
  tasks.add(task);
  requestSharedFrame();

  return () => {
    tasks.delete(task);
    if (tasks.size === 0 && frame !== null) {
      window.cancelAnimationFrame(frame);
      frame = null;
    }
  };
};
