const red = [255, 0, 0, 255]
const green = [0, 255, 0, 255]
const blue = [0, 0, 255, 255]
const black = [0, 0, 0, 255]

class Renderer {
    // canvas:              object ({id: __, width: __, height: __})
    // num_curve_sections:  int
    constructor(canvas, num_curve_sections, show_points_flag) {
        this.canvas = document.getElementById(canvas.id);
        this.canvas.width = canvas.width;
        this.canvas.height = canvas.height;
        this.ctx = this.canvas.getContext('2d');
        this.slide_idx = 0;
        this.num_curve_sections = num_curve_sections;
        this.show_points = show_points_flag;
        this.pointWidth = 5
        this.pointColor = black
    }

    // n:  int
    setNumCurveSections(n) {
        this.num_curve_sections = n;
        this.drawSlide(this.slide_idx);
    }

    // flag:  bool
    showPoints(flag) {
        this.show_points = flag;
        this.drawSlide(this.slide_idx);
    }
    
    // slide_idx:  int
    drawSlide(slide_idx) {
        this.slide_idx = slide_idx;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        switch (this.slide_idx) {
            case 0:
                this.drawSlide0(this.ctx);
                break;
            case 1:
                this.drawSlide1(this.ctx);
                break;
            case 2:
                this.drawSlide2(this.ctx);
                break;
            case 3:
                this.drawSlide3(this.ctx);
                break;
        }
    }

    // ctx:          canvas context
    drawSlide0(ctx) {
        this.drawRectangle({x: 500, y: 200}, {x: 670, y: 500}, red, ctx)
    }

    // ctx:          canvas context
    drawSlide1(ctx) {
        this.drawCircle({x: 300, y: 250}, 100, red, ctx)
    }

    // ctx:          canvas context
    drawSlide2(ctx) {
        this.drawBezierCurve(
            { x: 100, y: 100 },
            { x: 150, y: 400 },
            { x: 500, y: 350 },
            { x: 450, y: 125 },
            green,
            ctx
        )
    }

    // ctx:          canvas context
    drawSlide3(ctx) {
        
    }

    // pts:         array of object({x: __, y: __ })
    // ctx:          canvas context
    drawPoints(pts, ctx){
        if (this.show_points){
            pts.forEach( p => {
                this.drawPoint(this.pointWidth, p, this.pointColor, ctx)
            })
        }
    }

    drawPoint(width, center, color, ctx){
        const halfWidth = width / 2
        const points = [
            { x: center.x - halfWidth, y: center.y - halfWidth },
            { x: center.x - halfWidth, y: center.y + halfWidth },
            { x: center.x + halfWidth, y: center.y + halfWidth },
            { x: center.x + halfWidth, y: center.y - halfWidth },
        ]

        for(let i = 0; i < points.length; i++){
            let nextPoint = points[(i + 1) % points.length]
            this.drawLine(points[i], nextPoint, color, ctx)
        }
    
    }

    // left_bottom:  object ({x: __, y: __})
    // right_top:    object ({x: __, y: __})
    // color:        array of int [R, G, B, A]
    // ctx:          canvas context
    drawRectangle(left_bottom, right_top, color, ctx) {
        const left_top      = { x: left_bottom.x, y: right_top.y }
        const right_bottom  = { x: right_top.x, y: left_bottom.y }

        this.drawLine(left_bottom, left_top, color, ctx)
        this.drawLine(left_top, right_top, color, ctx)
        this.drawLine(right_top, right_bottom, color, ctx)
        this.drawLine(right_bottom, left_bottom, color, ctx)

        this.drawPoints([left_bottom, left_top, right_top, right_bottom], ctx)
    }

    // center:       object ({x: __, y: __})
    // radius:       int
    // color:        array of int [R, G, B, A]
    // ctx:          canvas context
    drawCircle(center, radius, color, ctx) {
        const points = []
        const n = this.num_curve_sections
        let phi = 0         // radians
        const phi_iter = (Math.PI * 2.0) / n

        for (let i = 0; i < n; i++){
            const pt0 = this.#polarToCartesian(radius, phi, center)
            phi += phi_iter
            const pt1 = this.#polarToCartesian(radius, phi, center)
            this.drawLine(pt0, pt1, color, ctx)
            points.push(pt0)
        }

        this.drawPoints(points, ctx)
    }

    // pt0:          object ({x: __, y: __})
    // pt1:          object ({x: __, y: __})
    // pt2:          object ({x: __, y: __})
    // pt3:          object ({x: __, y: __})
    // color:        array of int [R, G, B, A]
    // ctx:          canvas context
    drawBezierCurve(pt0, pt1, pt2, pt3, color, ctx) {
        const points = [pt0, pt1, pt2, pt3]
        const n = this.num_curve_sections
        let t = 0
        const t_iter = 1/this.num_curve_sections

        for (let i = 0; i < n; i++){
            const a = {
                x: this.#bezierParametric(pt0.x, pt1.x, pt2.x, pt3.x, t),
                y: this.#bezierParametric(pt0.y, pt1.y, pt2.y, pt3.y, t)
            }
            t += t_iter
            const b = {
                x: this.#bezierParametric(pt0.x, pt1.x, pt2.x, pt3.x, t),
                y: this.#bezierParametric(pt0.y, pt1.y, pt2.y, pt3.y, t)
            }
            this.drawLine(a, b, color, ctx)
            
            if (i != 0 ){ points.push(a) }
        }

        this.drawPoints(points, ctx)
    }

    // pt0:          object ({x: __, y: __})
    // pt1:          object ({x: __, y: __})
    // color:        array of int [R, G, B, A]
    // ctx:          canvas context
    drawLine(pt0, pt1, color, ctx)
    {
        ctx.strokeStyle = 'rgba(' + color[0] + ',' + color[1] + ',' + color[2] + ',' + (color[3]/255.0) + ')';
        ctx.beginPath();
        ctx.moveTo(pt0.x, pt0.y);
        ctx.lineTo(pt1.x, pt1.y);
        ctx.stroke();
    }

    // radius       int
    // phi          float (radians)
    // center:      object ({x: __, y: __})
    #polarToCartesian(radius, phi, center){
        return {
            x: center.x + radius * Math.cos(phi), 
            y: center.y + radius * Math.sin(phi)
        }
    }
    
    // _0:           int (x or y value of pt0)
    // _1:           int (x or y value of pt1)
    // _2:           int (x or y value of pt2)
    // _3:           int (x or y value of pt3)
    #bezierParametric(_0, _1, _2, _3, t){
        return (
            (1 - t)**3 * _0
            + 3 * (1 - t)**2 * t * _1
            + 3 * (1 - t) * t**2 *_2 
            + t**3 * _3
        )
    }
};
