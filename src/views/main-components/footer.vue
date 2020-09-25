<template>
	<div class="foot">
		<Row type="flex" justify="space-around" class="help">
			<!-- <a class="item" href="" target="_blank">{{ $t('loginmessage') }}</a>  -->
		</Row>
		<Row type="flex" justify="center" class="copyright">
			Copyright © {{ year }} - 四川三维系统工程有限责任公司
			<a href target="_blank" style="margin: 0 5px"></a>
		</Row>
	</div>
</template>

<script>
export default {
	data() {
		return {
			timer: null,
			year: '',
		};
	},
	methods: {},
	mounted() {
		let myDate = new Date();
		this.year = String(myDate.getFullYear());
	},
};
</script>

<style lang="less">
.foot {
	position: fixed;
	bottom: 7vh;
	width: 368px;
	color: rgba(0, 0, 0, 0.45);
	font-size: 14px;
	.help {
		margin: 0 auto;
		margin-bottom: 1vh;
		width: 60%;
		.item {
			color: rgba(0, 0, 0, 0.45);
		}
		:hover {
			color: rgba(0, 0, 0, 0.65);
		}
	}
}
</style>
