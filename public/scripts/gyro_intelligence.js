function gyroIntelligence() {
   var inertia = 5;

   setInterval(function() {
      for (var user in positions) {
        var ship = players[user];
        var position = positions[user];

         // Get positions
         var ax = positions[user].x_serv * 5,
             ay = positions[user].y_serv * 5,
             az = positions[user].z_serv * 5;

         // Calibration
         ax -= 35;

         // Fix bug reverse
         if (az < 0) {
             ax -= az;
         }

         // Dead zone
         if (ax > -10 && ax < 10) {
             ax = 0;
             if (positions[user].vx > inertia) {
                 positions[user].vx -= inertia;
             } else if (positions[user].vx < -inertia) {
                 positions[user].vx += inertia;
             } else {
                 positions[user].vx = 0;
             }
         }
         if (ay > -10 && ay < 10) {
             ay = 0;
             if (positions[user].vy > inertia) {
                 positions[user].vy -= inertia;
             } else if (positions[user].vy < -inertia) {
                 positions[user].vy += inertia;
             } else {
                 positions[user].vy = 0;
             }
         }

         // Inertia
         positions[user].vx = positions[user].vx + ay;
         positions[user].vy = positions[user].vy + ax;

         positions[user].vx = positions[user].vx * 0.97;
         positions[user].vy = positions[user].vy * 0.97;
         positions[user].y = parseInt(positions[user].y + positions[user].vy / 50);
         positions[user].x = parseInt(positions[user].x + positions[user].vx / 50);

         boundingBoxCheck(user);

         // Check changes
         if (positions[user].x != positions[user].x_old || positions[user].y != positions[user].y_old) {
             // Update vessel position
             ship.x = positions[user].x;
             ship.y = positions[user].y;

             //console.log(user +" - "+ ship.x +":"+ ship.y);
             
             // Save actual position
             positions[user].x_old = positions[user].x;
             positions[user].y_old = positions[user].y;
         }
      }
   }, 25);


   function boundingBoxCheck(user) {
       if (positions[user].x < 0) {
           positions[user].x = 0;
           positions[user].vx = -positions[user].vx;
       }
       if (positions[user].y < 0) {
           positions[user].y = 0;
           positions[user].vy = -positions[user].vy;
       }
       if (positions[user].x > canvas_width - 20) {
           positions[user].x = canvas_width - 20;
           positions[user].vx = -positions[user].vx;
       }
       if (positions[user].y > canvas_height - 20) {
           positions[user].y = canvas_height - 20;
           positions[user].vy = -positions[user].vy;
       }
   }
}
