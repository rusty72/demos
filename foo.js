/**
 * Created by bug on 18/05/15.
 */
function animate_loop(ts) {
    console.log(Math.round((ts - anim_prevts) / frame_delta));
    anim_prevts = ts;
    cancel = window.requestAnimationFrame(animate_loop);
    if (count == 60) {
       window.cancelAnimationFrame(cancel);
    }
    count++;
}

var anim_cancel = window.requestAnimationFrame(animate_loop);
var anim_prevts = null;
var count = 0;
var FPS = 60
var frame_delta = 1 / FPS * 1000;