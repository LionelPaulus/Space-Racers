function gyroIntelligence() {
    var x = 0,
        y = 0,
        vx = 0,
        vy = 0,
        inertia = 5,
        x_old = 0,
        y_old = 0;

    setInterval(function() {
        var ship = players[0];

        // Get positions
        var ax = positions.x * 5,
            ay = positions.y * 5,
            az = positions.z * 5;

        // Calibration
        ax -= 35;

        // Fix bug reverse
        if (az < 0) {
            ax -= az;
        }

        // Dead zone
        if (ax > -10 && ax < 10) {
            ax = 0;
            if (vx > inertia) {
                vx -= inertia;
            } else if (vx < -inertia) {
                vx += inertia;
            } else {
                vx = 0;
            }
        }
        if (ay > -10 && ay < 10) {
            ay = 0;
            if (vy > inertia) {
                vy -= inertia;
            } else if (vy < -inertia) {
                vy += inertia;
            } else {
                vy = 0;
            }
        }

        // Inertia
        vx = vx + ay;
        vy = vy + ax;

        vx = vx * 0.97;
        vy = vy * 0.97;
        y = parseInt(y + vy / 50);
        x = parseInt(x + vx / 50);

        boundingBoxCheck();

        // Check changes
        if (x != x_old || y != y_old) {
            console.log("x: " + x + " y:" + y);
            // Update vessel position
            ship.x = x;
            ship.y = y;
            console.log('POSITIONS UPDATED');
            // Save actual position
            x_old = x;
            y_old = y;
        }
    }, 25);


    function boundingBoxCheck() {
        if (x < 0) {
            x = 0;
            vx = -vx;
        }
        if (y < 0) {
            y = 0;
            vy = -vy;
        }
        if (x > canvas_width - 20) {
            x = canvas_width - 20;
            vx = -vx;
        }
        if (y > canvas_height - 20) {
            y = canvas_height - 20;
            vy = -vy;
        }
    }
}
