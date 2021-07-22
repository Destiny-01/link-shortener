const app = new Vue({
  el: "#app",
  data: {
    url: "",
    slug: "",
    error: "",
    formVisible: true,
    created: null,
  },
  methods: {
    async createUrl() {
      this.error = "";
      const response = await fetch("/url", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          url: this.url,
          slug: this.slug || undefined,
        }),
      });
      if (response.ok) {
        const result = await response.json();
        this.formVisible = false;
        this.created = `https://bell.herokuapp.com/${result.slug}`;
      } else if (response.status === 429) {
        this.error =
          "You are sending too many requests. Try again in 30 seconds.";
      } else {
        const result = await response.json();
        this.error = result.message;
      }
    },
  },
});
// let url = document.getElementById("url");
// function submit() {
//   fetch("/url", {
//     method: "POST",
//     headers: {
//       "content-type": "application/json",
//     },
//     body: JSON.stringify({
//       url,
//       slug,
//     }),
//   }).then((res) => {
//     console.log(res);
//   });
// }
// let create = document.getElementById("create");
// let created = document.getElementById("created");
// let error = document.getElementById("error");
// let a = document.getElementsByTagName("a");

// function submitForm(form) {
//   $.ajax({
//     url: "/url",
//     method: "POST",
//     data: {
//       url: form.querySelector('input[name="url"]').value,
//       slug: form.querySelector('input[name="slug"]').value,
//     },
//     success: function (res) {
//       console.log(res);
//       if (res.error) {
//         error.innerHTML = `${res.error}`;
//       }
//       setTimeout(() => {
//         create.style.display = "block";
//       }, 1000);
//       created.innerHTML = `${res}`;
//     },
//     error: function (error) {
//       console.log(error);
//     },
//   });
// }
