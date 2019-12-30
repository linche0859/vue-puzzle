// 打亂原陣列，使用亂數排序
Array.prototype.shuffle = function() {
  for (let i = this.length - 1; i > 0; i--) {
    // 如this.length = 9，陣列索引最大為8
    // 需 (i + 1)
    let j = Math.floor(Math.random() * (i + 1));
    [this[i], this[j]] = [this[j], this[i]];
  }
};
/**
 * 取得磁磚
 * 總數為多少，就會返回多少長度的陣列
 * @param {integer} total 總數
 */
const getTiles = function(total) {
  let tiles = [];
  while (tiles.length < total) {
    tiles.push(tiles.length + 1);
  }
  return tiles;
};
/**
 * 檢查打亂的陣列是否可執行
 * 拼圖列數為奇數時，逆序列數和為偶數
 * 拼圖列數為偶數時，逆序列數和奇偶與空行奇偶和守恆
 * https://www.cnblogs.com/weiyinfu/p/5911340.html
 * @param {Array} ary 陣列
 * @param {integer} col 列數
 */
const checkResolvable = function(ary, col) {
  let count = 0;
  let space = 0;
  // 去除最大值，
  // 和找出空白位於行數，計算由1、2、3...
  ary = ary.filter((item, index) => {
    if (item === ary.length) space = (index % col) + 1;
    return item != ary.length;
  });

  // 找出逆序列數和
  // 每一位數之後，是否有比自身小，有則逆序列數和加一
  ary.forEach((item, index, ary) => {
    let j = index + 1;
    while (j < ary.length) {
      if (item > ary[j]) count++;
      j++;
    }
  });

  // 列數為奇數，看 count % 2 === 0，逆序列數和要為偶數
  // 列數為偶數，看 count % 2 + space % 2 === 0，逆序列數和 & 空行皆要為偶數
  return col % 2 ? count % 2 === 0 : (count % 2) + (space % 2) === 0;
};

/**
 * 取得格子的資料，顯示為2維陣列
 * @param {integer} col 列數
 */
const getGrids = function(col) {
  let tiles = getTiles(col * col); // 一維陣列
  let resolvable = false;

  // 找到陣列可執行為止
  while (!resolvable) {
    tiles.shuffle();
    resolvable = checkResolvable(tiles, col);
  }
  let grids = [];
  while (grids.length < col) {
    let row = [];
    while (row.length < col) {
      row.push({
        label: tiles[grids.length * col + row.length],
      });
    }
    grids.push(row);
  }
  return grids;
};

Vue.component('grid-component', {
  template: '#gridTemplate',
  props: {
    grid: {
      type: Object,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    index: {
      type: Number,
      required: true,
    },
  },
  computed: {
    correct() {
      return (
        this.index + 1 === this.grid.label && this.index + 1 !== this.total
      );
    },
  },
  methods: {
    clickHandler($event) {
      if ($event.target.text) this.$emit('move');
    },
  },
});

new Vue({
  data() {
    return {
      col: 3,
      move: 0,
      grids: [],
    };
  },
  computed: {
    newGrids() {
      let ary = [];
      if (this.grids.length) {
        this.grids.forEach((row, rowIndex) => {
          row.forEach((column, columnIndex) => {
            ary.push({
              row: rowIndex,
              column: columnIndex,
              label: column.label,
            });
          });
        });
      }
      return ary;
    },
    total() {
      return this.col * this.col;
    },
    // 空白格位置
    spacePosition() {
      return this.newGrids.find(grid => grid.label === this.col * this.col);
    },
    win() {
      let res = true;
      if (this.grids.length !== this.col) return false;
      this.newGrids.forEach((item, index) => {
        if (item.label !== index + 1) res = false;
      });
      return res;
    },
  },
  methods: {
    init() {
      this.grids = getGrids(this.col);
      this.move = 0;
    },
    moveHandler(grid) {
      let change = false; // space
      const {
        row: spaceRow,
        column: spaceColumn,
        label: spaceLabel,
      } = this.spacePosition;
      const { row, column } = grid;
      // 往左，往右，往上，往下
      if (
        (column - 1 >= 0 && spaceColumn === column - 1 && row === spaceRow) ||
        (column + 1 < this.col &&
          spaceColumn === column + 1 &&
          row === spaceRow) ||
        (row - 1 >= 0 && spaceRow === row - 1 && column === spaceColumn) ||
        (row + 1 < this.col && spaceRow === row + 1 && column === spaceColumn)
      ) {
        change = true;
      }

      if (change) {
        // 交換空白
        this.$set(this.grids[spaceRow], spaceColumn, { label: grid.label });
        // 交換數字
        this.$set(this.grids[row], column, { label: spaceLabel });
        this.move++;
      }
    },
  },
  watch: {
    col: {
      immediate: true,
      handler() {
        this.init();
      },
    },
  },
}).$mount('#app');
