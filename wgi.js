/**
 * Created by bug on 22/05/15.
 */
var canvas, context;

function max(a,b) { return a > b ? a: b; }
function min(a,b) { return a < b ? a: b; }

function Poly(cx, path, label, stroke, fill, linewidth, linetype) {
    this.cx = cx;
    this.path = path;
    this.stroke = stroke || 'rgb(0, 102, 255)';
    this.fill = fill || 'rgb(128, 179, 255)';
    this.linewidth = linewidth || 5;
    this.linetype = linetype || 'round';
    this.label = label;
}

Poly.prototype.width = function() {
    var point, max_x= 0, min_x = 0, px;
    for (var i = 0; i < this.path.length; i++) {
        point = this.path[i];
        if (point.hasOwnProperty('x')) {
            px = point.x;
        } else {
            px = point.mx;
        }
        max_x = max(px, max_x);
        min_x = min(px, min_x);
    }
    return max_x - min_x;
};

Poly.prototype.height = function() {
    var point, max_y= 0, min_y = 0, py;
    for (var i = 0; i < this.path.length; i++) {
        point = this.path[i];
        if (point.hasOwnProperty('y')) {
            py = point.y;
        } else {
            py = point.my;
        }
        max_y = max(py, max_y);
        min_y = min(py, min_y);
    }
    return max_y - min_y;
};

Poly.prototype.draw = function(x,y) {
    x = x || 0;
    y = y || 0;
    this.cx.save();
    this.cx.translate(x,y);
    this.cx.strokeStyle = this.stroke;
    this.cx.fillStyle = this.fill;
    this.cx.lineWidth = this.linewidth;
    this.cx.lineJoin = this.linetype;
    this.cx.lineCap = this.linetype;
    this.cx.beginPath();
    var path;
    if (this.hasOwnProperty('_tl_path_'))
        path = this._tl_path_;
    else
        path = this.path;

    var point, px, py;
    for (var i = 0; i < path.length; i++) {
        point = path[i];
        if (point.hasOwnProperty('x')) {
            px = point.x;
            py = point.y;
            this.cx.lineTo(px, py);
        } else {
            px = point.mx;
            py = point.my;
            this.cx.moveTo(px, py);
        }
    }
    this.cx.closePath();
    if (this.fill)
        this.cx.fill();
    this.cx.stroke();
    this.cx.restore();
    if (this.hasOwnProperty('_tl_path_'))
        delete this._tl_path_;
};

Poly.prototype.translate = function(x, y, apply) {
    var xt, yt;
    var path,foo;
    if (this.hasOwnProperty('_tl_path_'))
        path = this._tl_path_;
    else
        path = this.path;

    foo = path.map(function(point) {
        if (point.hasOwnProperty('x')) {
            xt = point.x + x;
            yt = point.y + y;
            return {x: xt, y: yt};
        }
        else {
            xt = point.mx + x;
            yt = point.my + y;
            return {mx: xt, my: yt};
        }
    });
    if (apply)
        this.path = foo;
    else
        this._tl_path_ = foo;

    return this;
};

Poly.prototype.rotate = function(angle, around, apply) {
    var radians = (Math.PI / 180) * angle;
    var xr, yr;
    var centre = around || { x: 0.5 * this.width(), y: 0.5 * this.height()};
    var path, foo;
    if (this.hasOwnProperty('_tl_path_'))
        path = this._tl_path_;
    else
        path = this.path;

    foo = path.map(function(point) {
        if (point.hasOwnProperty('x')) {
            xr = centre.x + ((point.x - centre.x) * Math.cos(radians) - (point.y - centre.y) * Math.sin(radians));
            yr = centre.y + ((point.x - centre.x) * Math.sin(radians) + (point.y - centre.y) * Math.cos(radians));
            return {x: xr, y: yr};
        }
        else {
            xr = centre.x + ((point.mx - centre.x) * Math.cos(radians) - (point.my - centre.y) * Math.sin(radians));
            yr = centre.y + ((point.mx - centre.x) * Math.sin(radians) + (point.my - centre.y) * Math.cos(radians));
            return {mx: xr, my: yr};
        }
    });
    if (apply)
        this.path = foo;
    else
        this._tl_path_ = foo;

    return this;
};

Poly.prototype.scale = function(xscale, yscale, apply) {
    var xs, ys;
    var path, foo;
    if (this.hasOwnProperty('_tl_path_'))
        path = this._tl_path_;
    else
        path = this.path;

    foo = path.map(function(point) {
        if (point.hasOwnProperty('x')) {
            xs = point.x * xscale;
            ys = point.y * yscale;
            return {x: xs, y: ys};
        }
        else {
            xs = point.mx * xscale;
            ys = point.my * yscale;
            return {mx: xs, my: ys};
        }
    });
    if (apply)
        this.path = foo;
    else
        this._tl_path_ = foo;

    return this;
};

function PolyCombine(context, polys_list, label, stroke, fill, linewidth, linetype) {
/*
    Poly_list = [ list of { x: <offset x>, y: <offset y>, poly: <poly instance> ]
*/
    this.polys = [];
    var path = [];
    for (var i = 0; i < polys_list.length; i++) {
        //console.log(i);
        var entry = polys_list[i];
        if (entry.hasOwnProperty('x') && entry.hasOwnProperty('y') && entry.hasOwnProperty('poly')) {
            var x = entry.x;
            var y = entry.y;
            var poly = entry.poly;
            if (poly instanceof Poly) {
                this.polys.push(entry);
                var temp_poly = new Poly(poly.cx, poly.path, poly.label).translate(x,y,true);
                var tmp_path = temp_poly.path;
                if (i != 0) {
                    if (tmp_path[0].hasOwnProperty('x')) {
                        path.push({ mx: tmp_path[0].x ,my: tmp_path[0].y });
                    }
                }
                for (var j =0; j < tmp_path.length; j++)
                    path.push(tmp_path[j]);
            }
        }
    }
    Poly.call(this, context, path, label, stroke, fill, linewidth, linetype);
}
PolyCombine.prototype = Object.create(Poly.prototype);
PolyCombine.prototype.constructor = PolyCombine;

function cv_rotate_tmp() {
    var x = 50;
    var y = 50;
    var width = 100;
    var height = 100;
    context.save();
    context.fillStyle = 'black';
    context.fillRect(x,y, width, height);

    var radians = 45 * Math.PI / 180;
    context.translate(x+0.5*width,y+0.5*height);
    context.rotate(radians);
    context.fillStyle = 'red';
    context.fillRect(-0.5*width,-0.5*height, width, height);
    context.restore();
}
var W, G, I, WGI, rect;

$(document).ready(function() {
    canvas = document.createElement('canvas');
    canvas.width = window.innerWidth - 50;
    canvas.height = window.innerHeight - 50;
    $('body').append(canvas);
    $(window).resize(function () {
        canvas.width = window.innerWidth - 50;
        canvas.height = window.innerHeight - 50;
    });
    context = canvas.getContext('2d');
    W = new Poly(context,
                    [
                        {x: 0, y: 0},
                        {x: 0, y: 100},
                        {x: 100, y: 60},
                        {x: 100, y: 0},
                        {x: 0, y: 0},
                        {mx: 30, my: 0},
                        {x: 30, y: 40},
                        {mx: 70, my: 0},
                        {x: 70, y: 40}
                    ], 'W'
                );
    G = new Poly(context,
                    [
                        {x: 0, y: 0},
                        {x: 0, y: 60},
                        {x: 100, y: 60},
                        {x: 100, y: 0},
                        {x: 0, y: 0},
                        {mx: 100, my: 20},
                        {x: 50, y: 20},
                        {x: 50, y: 35},
                        {x: 75, y: 35},
                        {x: 75, y: 45},
                        {mx: 75, my: 45}
                    ], 'G'
                );
    I = new Poly(context,
                    [
                        {x: 0, y: 0},
                        {x: 100, y: 0},
                        {x: 100, y: 20},
                        {x: 0, y: 20},
                        {x: 0, y: 0},
                        {mx: 0, my: 20},
                        {x: 0, y: 60},
                        {x: 100, y: 100},
                        {x: 100, y: 20}
                    ], 'I'
                );

    WGI = new PolyCombine(context,
        [
            { x: 0, y:0, poly: W },
            { x: 100, y: 0, poly: G},
            { x: 200, y: 0, poly: I }
        ]);

    rect = new Poly(context,
                    [
                        {x: 0, y: 0},
                        {x: 100, y: 0},
                        {x: 100, y: 100},
                        {x: 0, y: 100}
                    ]);


});
