<template>
  <Page>
    <GridLayout class="progressContainer" columns="*, 64">
      <Progress col="0" :value="backupProgress" maxValue="100" />
      <Label col="1" :text="`  ${backupProgress}%`" />
    </GridLayout>
  </Page>
</template>

<script>
export default {};
</script>

<style>
</style>