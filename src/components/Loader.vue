
<template>
    <div class="overlay">
        <div class="text-center">
         <div class="animate-spin rounded-full h-14 w-14 border-b-4 border-white mx-auto"></div>
         <p class="mt-4 text-white">Solicitando datos...</p>
       </div>
    </div>
</template>
<style sc   >

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000; 
}</style>