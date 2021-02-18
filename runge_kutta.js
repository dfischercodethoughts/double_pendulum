//there are four variables, omega 1, omega 2, omega 1 prime and omega 2 prime
//f(o1,o2,o1',o2') = [o1,o2,

function k1 (f,vars) {
    return f(vars);
}

function k2(f,vars,h=.1) {
    let g = 9.8
    let m1 = vars[0]
    let m2 = vars[1]
    let l1 = vars[2]
    let l2 = vars[3]
    let theta_1 = vars[4]
    let omega_1 = vars[5]
    let theta_2 = vars[6]
    let omega_2 = vars[7]
    let newy = [m1,m2,l1,l2,theta_1,omega_1,theta_2,omega_2]
    return f(y+h/2*k1(f,y))
}

function k3(f,vars,h = .1,util_vars) {
    return f(y+h/2*k2(f,y,h));
}

function k4(f,t,vars,h = .1,util_vars) {
    return f(y+h*k3(f,y,h));
}

function rk4(f,vars,h=.1,util_vars) {
    return y + 1/6*h*(k1(f,y) + 2 * k2(f,y,h) + 2*k3(f,y,h) + k4(f,y,h));
}

function diff_theta_1(omega_1) {
    return omega_1;
}

function diff_theta_2(omega_2) {
    return omega_2;
}

class double_pend {
    constructor(xoff, yoff) {
        this.xoffset = xoff
        this.yoffset = yoff
        this.m1 = 5;
        this.m2 = 5;
        this.g = 9.8;
        this.l1 = 50;
        this.l2 = 50;
        this.x1 = 0;
        this.x2 = 0;
        this.y1 = 0;
        this.y2 = 0;
        //angle from vertical line
        // clockwise is positive
        this.theta_1 = 1;
        this.theta_2 = 1;
        this.omega_1 = 1;
        this.omega_1_prime = 0;
        this.omega_2 = 1;
        this.omega_2_prime = 0;
        this.updates = 30;
        this.time = new Date();
        this.time_since_last_update = 0;
        this.compute_position();
    }

    get_verbose_vars() {
        return [this.m1,this.m2,this.l1,this.l2,this.theta_1,this.omega_1,this.theta_2,this.omega_2,this.omega_1_prime,this.omega_2_prime,]
    }

    get_vars() {
        return [this.theta_1,this.omega_1,this.theta_2,this.omega_2,this.omega_1_prime,this.omega_2_prime,this.time];
    }

    compute_position() {
        this.x1 = Math.sin(this.theta_1) * this.l1+this.xoffset;
        this.y1 = this.yoffset - Math.cos(this.theta_1) * this.l1;
        this.x2 = Math.sin(this.theta_2) * this.l2+this.x1;
        this.y2 = this.y1 - Math.cos(this.theta_2) * this.l2;
    }

    diff_omega_1() {
        let num = -this.g * (2*this.m1+this.m2)*Math.sin(this.theta_1) - this.m2 * this.g * Math.sin(this.theta_1-2*this.theta_2) - 2 * Math.sin(this.theta_1-this.theta_2) * this.m2 * (this.omega_2^2 * this.l2 + this.omega_1^2 * this.l1 * Math.cos(this.theta_1-this.theta_2));
        let den = this.l1 * (2 * this.m1 + this.m2 - this.m2 * Math.cos(2 * this.theta_1-2*this.theta_2));
        return num/den;
    }

    diff_omega_2() {
        // this is the angular accel of the top bar
        let num = 2 * Math.sin(this.theta_1-this.theta_2) * (this.omega_1^2 * this.l1 * (this.m1+this.m2) + this.g * (this.m1+this.m2) * Math.cos(this.theta_1)+this.omega_2^2 * this.l2 * this.m2*Math.cos(this.theta_1-this.theta_2));
        let den = this.l2 * (2 * this.m1 + this.m2 - this.m2*Math.cos(2*this.theta_1-2*this.theta_2));
        return num/den;
    }

    limit_thetas() {
        if (this.theta_1 > Math.PI) {
            this.theta_1 = -(2 * Math.PI - this.theta_1);
        }
        else if (this.theta_1 < -Math.PI) {
            this.theta_1 = 2 * Math.PI + this.theta_1;
        }
        if (this.theta_2 > Math.PI) {
            this.theta_2 = -(2 * Math.PI - this.theta_2);
        }
        else if (this.theta_2 < -Math.PI) {
            this.theta_2 = 2 * Math.PI + this.theta_2;
        }
    }

    perform_step() {
        this.limit_thetas();
        let vars = this.get_vars();
        let updates = new Array(vars.length);
        updates[0] = vars[1];//theta_1'
        updates[1] = this.diff_omega_1();//theta_1''
        updates[2] = vars[3];//theta_2'
        updates[3] = this.diff_omega_2();//theta_2''
        return updates;
    }

    draw_weight1() {
        let canvas = document.getElementById('drawBoard');
        let ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(this.x1, this.y1, 10, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.closePath();
    }

    draw_weight2() {
        let canvas = document.getElementById('drawBoard');
        let ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(this.x2, this.y2, 10, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.closePath();
    }

    draw_arm1() {
        let canvas = document.getElementById('drawBoard');
        let ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.moveTo(this.xoffset,this.yoffset);
        ctx.lineTo(this.x1,this.y1);
        ctx.stroke();
        ctx.closePath();
    }

    draw_arm2() {
        let canvas = document.getElementById('drawBoard');
        let ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.moveTo(this.x1,this.y1);
        ctx.lineTo(this.x2,this.y2);
        ctx.stroke();
        ctx.closePath();
    }

    draw() {
        // console.log("drawing function")
        //
        let canvas = document.getElementById('drawBoard');
        let ctx = canvas.getContext("2d");
        ctx.clearRect(0,0,canvas.width,canvas.height);
        ctx.fillStyle = '#000000';
        this.draw_weight1();
        this.draw_weight2();
        this.draw_arm1();
        this.draw_arm2();

    }

    print_state() {
        console.log("printing state")
        console.log("\tx1, y1: " + this.x1 + " " + this.y1)
        console.log("\tx2, y2: " + this.x2 + " " + this.y2)
        console.log("\ttheta 1 : " + this.theta_1 + " theta 2: " + this.theta_2);
    }
}

function f(o1, o2, o1prime, o2prime,util_vars) {
    return [o1,o2,f1()]
}

function f1(vars,util_vars) {
    let g = 9.8
    let m1 = util_vars[0]
    let m2 = util_vars[1]
    let l1 = util_vars[2]
    let l2 = util_vars[3]
    let theta_1 = vars[0]
    let omega_1 = vars[1]
    let theta_2 = vars[2]
    let omega_2 = vars[3]

    let num = -g * (2*m1+m2)*Math.sin(theta_1) - m2 * g * Math.sin(theta_1-2*theta_2) - 2 * Math.sin(theta_1-theta_2) * m2 * (omega_2^2 * l2 + omega_1^2 * l1 * Math.cos(theta_1-theta_2));
    let den = l1 * (2 * m1 + m2 - m2 * Math.cos(2 * theta_1-2*theta_2));
    return num/den;
}

function f2(vars, util_vars) {
    let g = 9.8
    let m1 = vars[0]
    let m2 = vars[1]
    let l1 = vars[2]
    let l2 = vars[3]
    let theta_1 = vars[4]
    let omega_1 = vars[5]
    let theta_2 = vars[6]
    let omega_2 = vars[7]
    // this is the angular accel of the top bar
    let num = 2 * Math.sin(theta_1-theta_2) * (omega_1^2 * l1 * (m1+m2) + g * (m1+m2) * Math.cos(theta_1)+omega_2^2 * l2 * m2*Math.cos(theta_1-theta_2));
    let den = l2 * (2 * m1 + m2 - m2*Math.cos(2*theta_1-2*theta_2));
    return num/den;
}

let c = document.getElementById("drawBoard");
let my_pen = new double_pend(250,250);

function main_loop() {
        let timestamp = new Date();
        my_pen.time_since_last_update += timestamp - my_pen.time;
        my_pen.time = timestamp;
        let step = my_pen.time_since_last_update;
        if (step > my_pen.updates) {
            my_pen.time_since_last_update = 0
            console.log("\tvars: " + my_pen.get_vars())
            console.log("computing new position")
            my_pen.compute_position();
            console.log("drawing")
            my_pen.print_state()
            console.log("finding updates")
            this.limit_thetas();
            let vars = this.get_vars();
            let verbose_vars = this.get_verbose_vars();
            let updates = new Array(vars.length);
            updates[0] = vars[1];//theta_1'
            updates[1] = this.diff_omega_1();//theta_1''
            updates[2] = vars[3];//theta_2'
            updates[3] = this.diff_omega_2();//theta_2''
            console.log("updates:\n\t" + updates);
            my_pen.theta_1 = my_pen.theta_1 + vars[1] * .1;
            my_pen.theta_2 = my_pen.theta_2 + vars[3] * .1;
            my_pen.omega_1 = rk4(f1,0,verbose_vars,.1)
            // my_pen.omega_1_prime = updates[1];
            my_pen.omega_2 = rk4(f2,0,verbose_vars,.1)
            // my_pen.omega_2_prime = updates[3];
            console.log("refitting thetas")
            my_pen.limit_thetas();
            my_pen.draw();
        }
        window.requestAnimationFrame(main_loop);
    }

function run_sim() {
    window.requestAnimationFrame(main_loop);
}