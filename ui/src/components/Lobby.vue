<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const roomName = ref('');

const createRoom = () => {
  if (roomName.value.trim()) {
    // 使用 Vue Router 进行导航
    router.push(`/room/${roomName.value.trim()}`);
  } else {
    alert('房间名不能为空');
  }
};
</script>

<template>
  <div class="main-container">
    <div>
      <h1>桌面共享</h1>
      <div class="input-row">
        <div>
          <button type="button" class="btn btn-success" @click="createRoom">
            创建房间
          </button>
        </div>
        <div class="input-container">
          <input
            v-model="roomName"
            class="form-control"
            placeholder="输入房间号"
          >
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.main-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

.input-row {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.input-container {
  flex: 1;
}

h1 {
  text-align: center;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-success {
  background-color: #28a745;
  color: white;
}

.form-control {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
}
</style> 