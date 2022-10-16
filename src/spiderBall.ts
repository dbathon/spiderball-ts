const LEVELS = [
  "3a2646254635563556245f245f4039403f295a29,",
  "33263d263d3042324525421f321f2e22303b253b251b2f1241114a174e26483c343838292a32,431a",
  "3253311e631e635335395d3b,393542354c355735",
  "30303019461a46264a35473a46493445353f413f41393d353f2439253930342b3842,4431",
  "40303e244a1d59265839513950354835493c413c40325032503049214436,472c",
  "32245724572862286230392f3a366336634e324e32455844583e323e5b2a3749,3d2b4638603e50264e48",
  "34233d23402f4039453945324032402f4e2f4e33493349385138513e573e574a4c4a4b434542453c373c39275146,4a3c",
  "46304e304d3c424a36492f442d322520260c2e063a0447104a07550a5516481c39142e1732243731383d3f404a334e0d,33382f2a2a1b350c",
  "282b7d2b7d3228322c2e782e,602e512e422e322e",
  "11150e1e182a2b39404157436b427c3c7e3377316d3d6741613e633c663e71366f3368345f37573c53394d364839503c463c3e3848394d36352e32322e362c342f303232352e2e2b252b1c1f1a17161b7935,3539",
];

const OBSTACLE_SIZE = 30;
const TARGET_SIZE = 20;

class Point {
  constructor(public x: number, public y: number) {}

  distanceTo(other: Point): number {
    const dx = other.x - this.x;
    const dy = other.y - this.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}

class Obstacle extends Point {
  constructor(x: number, y: number, public ds_9_: number) {
    super(x, y);
  }

  contains(point: Point): boolean {
    return this.distanceTo(point) <= OBSTACLE_SIZE;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, OBSTACLE_SIZE, 0, 2 * Math.PI);
  }
}

class Polygon {
  constructor(readonly points: Point[]) {}

  drawPath(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    let first = true;
    for (const point of this.points) {
      if (first) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
      first = false;
    }
    ctx.closePath();
  }

  /**
   * Performs the even-odd-rule Algorithm (a raycasting algorithm) to find out whether a point is in a given polygon.
   * This runs in O(n) where n is the number of edges of the polygon.
   *
   * From https://www.algorithms-and-technologies.com/point_in_polygon/javascript
   *
   * @return  whether the point is in the polygon (not on the edge, just turn < into <= and > into >= for that)
   */
  contains(point: Point): boolean {
    const polygon = this.points;
    // A point is in a polygon if a line from the point to infinity crosses the polygon an odd number of times
    let odd = false;
    // For each edge (In this case for each point of the polygon and the previous one)
    for (let i = 0, j = polygon.length - 1; i < polygon.length; i++) {
      // If a line from the point into infinity crosses this edge
      if (
        polygon[i].y > point.y !== polygon[j].y > point.y && // One point needs to be above, one below our y coordinate
        // ...and the edge doesn't cross our Y coordinate before our x coordinate (but between our x coordinate and infinity)
        point.x <
          ((polygon[j].x - polygon[i].x) * (point.y - polygon[i].y)) / (polygon[j].y - polygon[i].y) + polygon[i].x
      ) {
        // Invert odd
        odd = !odd;
      }
      j = i;
    }
    //If the number of crossings was odd, the point is in the polygon
    return odd;
  }
}

class Level {
  readonly ds = [
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
  ];
  readonly ds_4_ = [0, 0, 0, 0];

  readonly is: number[] = [];
  readonly levelPolygon: Polygon;

  readonly obstacles: Obstacle[] = [];

  i_5_: number;
  i_6_: number;

  a_double_fld = 0;
  b_double_fld = 0;
  c_double_fld = 0;
  d_double_fld = 0;

  constructor(levelString: string) {
    const [firstPart, obstaclesPart] = levelString.split(",");

    const ds_4_ = this.ds_4_;

    ds_4_[0] = parseInt(firstPart.substring(firstPart.length - 8, firstPart.length - 6), 16) * 16;
    ds_4_[1] = parseInt(firstPart.substring(firstPart.length - 6, firstPart.length - 4), 16) * 16;
    this.i_5_ = parseInt(firstPart.substring(firstPart.length - 4, firstPart.length - 2), 16) * 16;
    this.i_6_ = parseInt(firstPart.substring(firstPart.length - 2, firstPart.length), 16) * 16;

    this.a_double_fld = ds_4_[0] - 400.0;
    this.b_double_fld = ds_4_[1] - 400.0;

    const polygonPoints: Point[] = [];
    for (let i = 0; i < firstPart.length / 4 - 2; i++) {
      polygonPoints.push(
        new Point(
          parseInt(firstPart.substring(i << 2, (i << 2) + 2), 16) * 16,
          parseInt(firstPart.substring((i << 2) + 2, (i << 2) + 4), 16) * 16
        )
      );
    }
    this.levelPolygon = new Polygon(polygonPoints);

    if (obstaclesPart) {
      for (let i = 0; i < obstaclesPart.length / 4; i++) {
        this.obstacles.push(
          new Obstacle(
            parseInt(obstaclesPart.substring(i * 4, i * 4 + 2), 16) * 16,
            parseInt(obstaclesPart.substring(i * 4 + 2, i * 4 + 4), 16) * 16,
            1
          )
        );
      }
    }

    const ds = this.ds;
    ds[0][0] = ds_4_[0];
    ds[1][0] = ds_4_[1];
    ds[0][1] = ds_4_[0];
    ds[1][1] = ds_4_[1];
    ds[2][0] = -5.0;
    ds[2][1] = 5.0;
    ds[3][0] = -5.0;
    ds[3][1] = -5.0;
  }
}

export class SpiderBall {
  playing = true;
  success = false;
  readonly pressedKeys = new Set<string>();
  mouseX = 0;
  mouseY = 0;
  readonly pressedMouseButtons = new Set<number>();
  a_double_fld = 0;
  private levelIdx = 0;
  private level?: Level;

  constructor() {
    this.setLevel(0);
  }

  setLevel(idx: number) {
    const levelString = LEVELS[idx];
    if (levelString) {
      this.level = new Level(levelString);
      console.log("level:", this.level);
      this.levelIdx = idx;
      this.success = false;
    }
  }

  startLevelIfNotPlaying() {
    if (!this.playing) {
      this.setLevel(this.levelIdx);
      this.playing = true;
    }
  }

  // TODO: split the step from drawing...
  drawAndStep(ctx: CanvasRenderingContext2D) {
    const canvas = ctx.canvas;
    const w = canvas.width;
    const h = canvas.height;

    ctx.save();

    const level = this.level;
    if (level && this.playing) {
      ctx.save();

      const mouseX = this.mouseX + level.a_double_fld;
      const mouseY = this.mouseY + level.b_double_fld;
      const ds = level.ds;
      const ds_4_ = level.ds_4_;
      const levelPoly = level.levelPolygon;

      ctx.fillStyle = "#303030";
      ctx.fillRect(0, 0, w, h);

      //ctx.scale(0.5, 0.5);
      // TODO: draw cursor, remove this
      // ctx.fillStyle = "#909090";
      // ctx.fillRect(this.mouseX, this.mouseY, 10, 10);

      level.c_double_fld = ds_4_[0] - 400.0;
      level.d_double_fld = ds_4_[1] - 300.0;
      level.a_double_fld += (-level.a_double_fld + level.c_double_fld) / 30.0;
      level.b_double_fld += (-level.b_double_fld + level.d_double_fld) / 30.0;
      ctx.translate(-level.a_double_fld, -level.b_double_fld);

      if (this.pressedKeys.delete("KeyZ")) {
        this.pressedMouseButtons.add(0);
      }
      if (this.pressedKeys.delete("KeyX")) {
        this.pressedMouseButtons.add(2);
      }
      if (this.pressedKeys.delete("KeyC") || this.pressedMouseButtons.has(1)) {
        this.pressedMouseButtons.add(0);
        this.pressedMouseButtons.add(2);
      }

      const leftPressed = this.pressedMouseButtons.has(0);
      const rightPressed = this.pressedMouseButtons.has(2);
      this.pressedMouseButtons.clear();

      if (leftPressed || rightPressed) {
        const d = Math.atan2(mouseY - ds_4_[1], mouseX - ds_4_[0]);
        if (leftPressed) {
          ds[2][0] = 13.0 * Math.cos(d);
          ds[3][0] = 13.0 * Math.sin(d);
          ds[0][0] = ds_4_[0];
          ds[1][0] = ds_4_[1];
          ds[4][0] = 0.0;
        }
        if (rightPressed) {
          ds[2][1] = 13.0 * Math.cos(d);
          ds[3][1] = 13.0 * Math.sin(d);
          ds[0][1] = ds_4_[0];
          ds[1][1] = ds_4_[1];
          ds[4][1] = 0.0;
        }
      }

      ctx.lineWidth = 14;
      ctx.strokeStyle = "#101010";
      ctx.translate(-5, -5);
      levelPoly.drawPath(ctx);
      ctx.stroke();

      ctx.translate(5, 5);
      ctx.fillStyle = "#758085";
      levelPoly.drawPath(ctx);
      ctx.fill();

      // draw the target
      ctx.lineWidth = 1;
      ctx.strokeStyle = "#ffcc00";
      ctx.beginPath();
      ctx.arc(level.i_5_, level.i_6_, TARGET_SIZE + 5, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(level.i_5_, level.i_6_, TARGET_SIZE, 0, 2 * Math.PI);
      ctx.stroke();

      for (let i_13_ = 0; i_13_ < 2; i_13_++) {
        if (
          !levelPoly.contains(new Point(ds[0][i_13_], ds[1][i_13_])) &&
          !levelPoly.contains(new Point(ds[0][i_13_] + 5, ds[1][i_13_] + 5))
        ) {
          ds[4][i_13_] = 1.0;
          ds[2][i_13_] = 0.0;
        }
      }
      if (
        !levelPoly.contains(new Point(ds_4_[0], ds_4_[1])) &&
        !levelPoly.contains(new Point(ds_4_[0] + 5, ds_4_[1] + 5))
      ) {
        this.playing = false;
      }

      const obstacles = level.obstacles;
      for (let i_14_ = 0; i_14_ < obstacles.length; i_14_++) {
        const obstacle = obstacles[i_14_];
        if (
          !levelPoly.contains(
            new Point(obstacle.x + OBSTACLE_SIZE + 60.0 * Math.sign(obstacle.ds_9_), obstacle.y + OBSTACLE_SIZE)
          )
        ) {
          obstacle.ds_9_ *= -1.0;
        }
        for (let i_15_ = 0; i_15_ < 2; i_15_++) {
          if (obstacle.contains(new Point(ds[0][i_15_], ds[1][i_15_]))) {
            if (ds[4][i_15_] == 0.0) {
              ds[4][i_15_] = 2 + i_14_;
            } else {
              const d_18_ = Math.atan2(ds[1][i_15_] - ds_4_[1], ds[0][i_15_] - ds_4_[0]);
              const d_19_ = Math.sqrt(Math.pow(ds[0][i_15_] - ds_4_[0], 2.0) + Math.pow(ds[1][i_15_] - ds_4_[1], 2.0));
              obstacles[i_14_].ds_9_ += (-d_19_ / 1500.0) * Math.cos(d_18_);
            }
          }
        }
        if (obstacle.contains(new Point(ds_4_[0], ds_4_[1]))) {
          this.playing = false;
        }
        obstacle.ds_9_ *= 0.997;
        for (let i_20_ = 0; i_20_ < 2; i_20_++) {
          if (ds[4][i_20_] == 2 + i_14_) ds[2][i_20_] = obstacle.ds_9_;
        }
        obstacle.x += obstacle.ds_9_;

        ctx.lineWidth = 14;
        ctx.strokeStyle = "#101010";
        ctx.translate(4, 4);
        obstacle.draw(ctx);
        ctx.stroke();
        ctx.translate(-4, -4);
        ctx.fillStyle = "#404040";
        obstacle.draw(ctx);
        ctx.fill();
      }

      for (let i_21_ = 0; i_21_ < 2; i_21_++) {
        const d = Math.atan2(ds[1][i_21_] - ds_4_[1], ds[0][i_21_] - ds_4_[0]);
        const d_22_ = Math.sqrt(Math.pow(ds[0][i_21_] - ds_4_[0], 2.0) + Math.pow(ds[1][i_21_] - ds_4_[1], 2.0));
        let ds_23_: number[];
        let i_24_: number;
        let d_25_: number;
        let d_26_: number;
        let d_27_: number;
        if (ds[4][i_21_] == 0.0) {
          ds[0][i_21_] += ds[2][i_21_];
          ds[1][i_21_] += ds[3][i_21_];
          ds[2][i_21_] *= 0.992;
          ds[3][i_21_] *= 0.992;
          ds[3][i_21_] += 0.09;
          ds[2][i_21_] += (-d_22_ / 1500.0) * Math.cos(d);
          ds[3][i_21_] += (-d_22_ / 1500.0) * Math.sin(d);
          ds_4_[2] += (d_22_ / 4000.0) * Math.cos(d);
          ds_23_ = ds_4_;
          i_24_ = 3;
          d_25_ = ds_23_[i_24_];
          d_26_ = d_22_;
          d_27_ = 4000.0;
        } else {
          ds[0][i_21_] += ds[2][i_21_];
          ds_4_[2] += (d_22_ / 1500.0) * Math.cos(d);
          ds_23_ = ds_4_;
          i_24_ = 3;
          d_25_ = ds_23_[i_24_];
          d_26_ = d_22_;
          d_27_ = 1500.0;
        }
        ds_23_[i_24_] = d_25_ + (d_26_ / d_27_) * Math.sin(d);

        ctx.lineWidth = 1;

        ctx.strokeStyle = "white";
        ctx.beginPath();
        ctx.arc(ds[0][i_21_], ds[1][i_21_], 5, 0, 2 * Math.PI);
        ctx.stroke();

        ctx.strokeStyle = i_21_ == 0 ? "orange" : "red";
        ctx.beginPath();
        ctx.moveTo(ds[0][i_21_], ds[1][i_21_]);
        ctx.lineTo(ds_4_[0], ds_4_[1]);
        ctx.stroke();
      }

      ds_4_[3] += 0.09;
      ds_4_[2] *= 0.98;
      ds_4_[3] *= 0.98;
      ds_4_[0] += ds_4_[2];
      ds_4_[1] += ds_4_[3];

      const playerCircles: [string, number, number, number, number][] = [
        ["black", 0, 0, 10, 10],
        ["#0077ff", 0, 0, 9, 9],
        ["#00ccff", -1, -1.5, 7, 6.5],
        ["#aaf9ff", -2, -2.5, 5, 4.5],
      ];
      for (const [style, offsetX, offsetY, radiusX, radiusY] of playerCircles) {
        ctx.fillStyle = style;
        ctx.beginPath();
        ctx.ellipse(ds_4_[0] + offsetX, ds_4_[1] + offsetY, radiusX, radiusY, 0, 0, 2 * Math.PI);
        ctx.fill();
      }

      if (Math.sqrt(Math.pow(ds_4_[0] - level.i_5_, 2.0) + Math.pow(ds_4_[1] - level.i_6_, 2.0)) < TARGET_SIZE) {
        this.playing = false;
        this.success = true;
        this.levelIdx = (this.levelIdx + 1) % LEVELS.length;
      }

      ctx.translate(level.a_double_fld, level.b_double_fld);
      ctx.fillStyle = "#ffffff";
      ctx.font = "16px sans-serif";
      // TODO: time
      const time = 0;
      ctx.fillText(this.levelIdx + 1 + ": " + time + "s", 15, 30);

      if (this.pressedKeys.delete("KeyR")) {
        this.playing = false;
      }
      if (this.pressedKeys.delete("KeyL")) {
        /*
          TODO: load map
          String string;
          if ((string = JOptionPane.showInputDialog("Load map", "")) != null) {
              level_idx = levels.length - 1;
              levels[levels.length - 1] = string;
              playing = false;
          }
          */
      }
      if (this.pressedKeys.delete("KeyW")) {
        this.levelIdx = Math.min(this.levelIdx + 1, LEVELS.length - 1);
        this.playing = false;
        this.success = true;
      }
      if (this.pressedKeys.delete("KeyQ")) {
        this.levelIdx = Math.max(this.levelIdx - 1, 0);
        this.playing = false;
        this.success = true;
      }
      ctx.restore();

      if (!this.playing) {
        // not playing
        ctx.fillStyle = "#ffffff";
        ctx.font = "16px sans-serif";
        if (this.success) {
          ctx.fillText("Level passed - click to begin", 320, 300);
        } else {
          ctx.fillText("Game over - click to begin", 330, 300);
        }
      }
    }

    ctx.restore();
  }
}
