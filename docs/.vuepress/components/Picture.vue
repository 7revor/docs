<template>
  <div id="Picture" class="pic-container">
    <img @click="imgShow" :src="path" :style="{ width: width + 'px' }" />
    <p>{{ name }}</p>
  </div>
</template>

<script>
export default {
  name: "Picture",
  props: ["src", "name", "width"],
  computed: {
    path() {
      return /^http/.test(this.src) ? this.src : `/img/${this.src}`;
    },
  },
  methods: {
    imgShow() {
      const app = document.getElementById("app");
      const wrapper = document.createElement("div");

      const clickListener = (ev) => {
        if (ev.target.tagName !== "IMG") {
          destory();
        }
      };
      const scrollListener = () => {
        destory();
      };
      const destory = () => {
        wrapper.removeEventListener("click", clickListener);
        window.removeEventListener("scroll", scrollListener);
        wrapper.style.opacity = "0";
        setTimeout(() => {
          app.removeChild(wrapper);
        }, 500);
      };
      wrapper.addEventListener("click", clickListener);
      window.addEventListener("scroll", scrollListener);
      const img = document.createElement("img");
      img.setAttribute("class", "img-content");
      img.setAttribute("src", this.path);
      wrapper.appendChild(img);
      wrapper.setAttribute("class", "img-wrapper");
      app.appendChild(wrapper);
      setTimeout(() => {
        wrapper.style.opacity = "1";
      });
    },
  },
};
</script>

<style>
.pic-container {
  margin-top: 20px;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
}
.pic-container img {
  cursor: pointer;
}
.pic-container p {
  color: #999;
  text-align: center;
}
.img-wrapper {
  position: fixed;
  width: 100%;
  height: 100%;
  z-index: 9999;
  top: 0;
  left: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
  opacity: 0;
  transition: opacity 0.3s;
  -moz-transition: opacity 0.3s; /* Firefox 4 */
  -webkit-transition: opacity 0.3s; /* Safari 和 Chrome */
  -o-transition: opacity 0.3s; /* Opera */
}
.img-content {
  max-width: 80%;
  max-height: 80%;
  height: auto;
  width: auto;
}
</style>
