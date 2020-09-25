<style lang="less">
@import '../../../styles/table-common.less';
@import './flow-model.less';
</style>
<template>
	<div class="search" :style="{minHeight: fitHeight}">
		<Card>
			<Row v-show="openSearch" @keydown.enter.native="handleSearch">
				<Form ref="searchForm" :model="searchForm" inline :label-width="100">
					<Form-item label="模型名称" prop="modelName">
						<Input
							type="text"
							v-model="searchForm.modelName"
							placeholder="请输入模型名称"
							clearable
							style="width: 200px"
						/>
					</Form-item>
					<Form-item label="模型标识" prop="modelKey">
						<Input
							type="text"
							v-model="searchForm.modelKey"
							placeholder="请输入模型标识"
							clearable
							style="width: 200px"
						/>
					</Form-item>
					<Form-item style="margin-left:-35px;" class="br">
						<Button @click="handleSearch" type="primary" icon="ios-search">搜索</Button>
						<Button @click="handleReset">重置</Button>
					</Form-item>
				</Form>
			</Row>
			<Row class="operation">
				<Button @click="add" type="primary" icon="md-add">新增流程模型</Button>
				<Button type="dashed" @click="getDataList">刷新数据</Button>
				<Button type="dashed" @click="openSearch=!openSearch">{{openSearch ? "关闭搜索" : "开启搜索"}}</Button>
				<Button type="dashed" @click="openTip=!openTip">{{openTip ? "关闭提示" : "开启提示"}}</Button>
			</Row>
			<Row v-show="openTip">
				<Alert show-icon>
					已选择数据
					<span class="select-count">{{selectCount}}</span> 项
					<a class="select-clear" @click="clearSelectAll">清空</a>
				</Alert>
			</Row>
			<Row>
				<Table
					:loading="loading"
					border
					:columns="columns"
					:data="data"
					sortable="custom"
					@on-sort-change="changeSort"
					@on-selection-change="showSelect"
					ref="table"
					size="small"
				></Table>
			</Row>
			<Row type="flex" justify="end" class="page">
				<Page
					:current="searchForm.pageNumber"
					:total="total"
					:page-size="searchForm.pageSize"
					@on-change="changePage"
					@on-page-size-change="changePageSize"
					:page-size-opts="[10,20,50]"
					size="small"
					show-total
					show-elevator
					show-sizer
				></Page>
			</Row>
		</Card>

		<Modal :title="modalTitle" v-model="modalVisible" :mask-closable="false" :width="500">
			<Form ref="form" :model="form" :label-width="80" :rules="formValidate">
				<FormItem label="流程分类" prop="categoryName">
					<div style="display:flex;">
						<Input
							v-model="form.categoryName"
							disabled
							readonly
							style="margin-right:10px;"
							placeholder="请选择流程分类"
						/>
						<Poptip transfer trigger="click" placement="right-start" title="流程分类" width="250">
							<Button icon="md-list">选择分类</Button>
							<div slot="content" style="position:relative;min-height:5vh">
								<Tree :data="dataEdit" @on-select-change="selectTreeEdit"></Tree>
								<Spin size="large" fix v-if="loadingEdit"></Spin>
							</div>
						</Poptip>
					</div>
				</FormItem>
				<FormItem label="模型标识" prop="modelKey">
					<Input
						v-model="form.modelKey"
						maxlength="25"
						show-word-limit
						placeholder="请输入标识Key，例如：modelSellCard"
					/>
				</FormItem>
				<FormItem label="模型名称" prop="modelName">
					<Input
						v-model="form.modelName"
						maxlength="25"
						show-word-limi
						placeholder="请输入模型名称，例如：流程模型_售卡业务"
					/>
				</FormItem>
				<FormItem label="是否启用" prop="statusCode">
					<i-switch size="large" v-model="form.statusCode" :true-value="1" :false-value="0">
						<span slot="open">启用</span>
						<span slot="close">禁用</span>
					</i-switch>
				</FormItem>
				<FormItem label="描述" prop="description">
					<Input
						v-model="form.description"
						type="textarea"
						:autosize="{minRows: 4,maxRows: 6}"
						placeholder="一些描述"
					></Input>
				</FormItem>
			</Form>
			<div slot="footer">
				<Button type="text" @click="handelCancel">取消</Button>
				<Button type="primary" :loading="submitLoading" @click="handelSubmit">提交</Button>
			</div>
		</Modal>

		<Modal
			:closable="false"
			@on-cancel="handleClose"
			v-model="showModeler"
			:mask-closable="false"
			footer-hide
			fullscreen
			class="modeler"
		>
			<div slot="header">
				<div class="ivu-modal-header-inner">Activiti工作流在线流程设计</div>
				<a @click="handleClose" class="ivu-modal-close">
					<Icon type="ios-close" size="31" class="ivu-icon-ios-close" />
				</a>
			</div>
			<div style="position:relative;height: 100%;">
				<iframe
					id="iframe"
					:src="modelerUrl"
					frameborder="0"
					width="100%"
					height="100%"
					scrolling="auto"
				></iframe>
				<Spin fix size="large" v-if="modelerLoading"></Spin>
			</div>
		</Modal>
	</div>
</template>

<script>
import {
	getCategoryList,
	getModelList,
	insertModel,
	deployModel,
	exportModel,
	deleteModel,
	disableModel,
	enableModel
} from '@/api/card-flow-api';
export default {
	name: 'FlowModel',
	data() {
		return {
			publicPath: process.env.BASE_URL,
			openSearch: true,
			openTip: true,
			showModeler: false,
			loadingEdit: true,
			modelerLoading: false,
			domain: '',
			modelerUrl: '',
			fitHeight: '500px',
			loading: true,
			selectCount: 0,
			selectList: [],
			searchForm: {
				modelName: '',
				modelKey: '',
				pageNumber: 1,
				pageSize: 10
			},
			modalType: 0,
			modalVisible: false,
			modalTitle: '',
			form: {
				categoryId: '',
				modelName: '',
				modelKey: '',
				description: '',
				statusCode: 1
			},
			formValidate: {
				modelName: [
					{ required: true, message: '不能为空', trigger: 'blur' }
				],
				modelKey: [
					{ required: true, message: '不能为空', trigger: 'blur' }
				]
			},
			submitLoading: false,
			columns: [
				{
					type: 'selection',
					width: 60,
					align: 'center'
				},
				{
					type: 'index',
					width: 60,
					align: 'center'
				},
				{
					title: '流程分类',
					key: 'categoryName',
					align: 'center',
					minWidth: 120
				},
				{
					title: '模型标识',
					key: 'modelKey',
					align: 'center',
					minWidth: 150
				},
				{
					title: '模型名称',
					key: 'modelName',
					align: 'center',
					minWidth: 150
				},

				{
					title: '版本',
					key: 'version',
					minWidth: 80,
					align: 'center',
					render: (h, params) => {
						let re = '';
						if (params.row.version) {
							re = 'v.' + params.row.version;
						}
						return h('div', re);
					}
				},
				{
					title: '状态',
					key: 'statusCode',
					align: 'center',
					minWidth: 100,
					render: (h, params) => {
						return h(
							'i-switch',
							{
								props: {
									value: params.row.statusCode,
									size: 'large',
									'true-value': 1,
									'false-value': 0
								},
								on: {
									'on-change': v => {
										this.changeStatus(params.row, v);
									}
								}
							},
							[
								h('span', { slot: 'open' }, '启用'),
								h('span', { slot: 'close' }, '禁用')
							]
						);
					}
				},
				{
					title: '操作',
					key: 'action',
					minWidth: 335,
					align: 'center',
					//fixed: 'right',
					render: (h, params) => {
						return h('div', [
							h(
								'Button',
								{
									props: {
										type: 'warning',
										size: 'small'
									},
									style: {
										marginRight: '5px'
									},
									on: {
										click: () => {
											this.edit(params.row);
										}
									}
								},
								'在线设计'
							),
							h(
								'Button',
								{
									props: {
										type: 'info',
										size: 'small'
									},
									style: {
										marginRight: '5px'
									},
									on: {
										click: () => {
											this.deploy(params.row);
										}
									}
								},
								'部署发布'
							),
							h(
								'Button',
								{
									props: {
										size: 'small'
									},
									style: {
										marginRight: '5px'
									},
									on: {
										click: () => {
											this.export(params.row);
										}
									}
								},
								'导出XML'
							),
							h(
								'Button',
								{
									props: {
										type: 'error',
										size: 'small'
									},
									on: {
										click: () => {
											this.remove(params.row);
										}
									}
								},
								'删除'
							)
						]);
					}
				},
				{
					title: '模型描述',
					key: 'description',
					align: 'center',
					minWidth: 160
				},
				{
					title: '新增时间',
					key: 'addTime',
					width: 160
				}
			],
			data: [],
			total: 0,
			dataEdit: []
		};
	},
	methods: {
		init() {
			this.getDataList();
			this.getParentListEdit();
		},
		getParentListEdit() {
			this.loadingEdit = true;
			getCategoryList({
				categoryType: 1,
				statusCode: 1,
				pageNumber: 1,
				pageSize: 99
			}).then(res => {
				this.loadingEdit = false;
				if (res.success) {
					this.dataEdit = res.result.content;
				}
			});
		},
		selectTreeEdit(v) {
			if (v) {
				for (let attr in v[0]) {
					if (v[0][attr] == null) {
						v[0][attr] = '';
					}
				}
				let str = JSON.stringify(v[0]);
				let data = JSON.parse(str);
				this.form.categoryId = data.id;
				this.form.categoryName = data.title;
			}
		},
		changePage(v) {
			this.searchForm.pageNumber = v;
			this.getDataList();
			this.clearSelectAll();
		},
		changePageSize(v) {
			this.searchForm.pageSize = v;
			this.getDataList();
		},
		getDataList() {
			this.loading = true;
			getModelList(this.searchForm).then(res => {
				this.loading = false;
				if (res.success) {
					this.data = res.result.content;
					this.total = res.result.total;
				}
			});
		},
		handleSearch() {
			this.searchForm.pageNumber = 1;
			this.searchForm.pageSize = 10;
			this.getDataList();
		},
		handleReset() {
			this.$refs.searchForm.resetFields();
			this.searchForm.pageNumber = 1;
			this.searchForm.pageSize = 10;
			this.getDataList();
		},
		changeSort(e) {
			this.searchForm.sort = e.key;
			this.searchForm.order = e.order;
			if (e.order == 'normal') {
				this.searchForm.order = '';
			}
			this.getDataList();
		},
		handelCancel() {
			this.modalVisible = false;
		},
		handelSubmit() {
			this.$refs.form.validate(valid => {
				if (valid) {
					this.submitLoading = true;
					if (this.modalType == 0) {
						delete this.form.id;
						insertModel(this.form).then(res => {
							this.submitLoading = false;
							if (res.success) {
								this.$Msg.success('操作成功');
								this.getDataList();
								this.modalVisible = false;
							}
						});
					}
				}
			});
		},
		add() {
			this.modalType = 0;
			this.modalTitle = '新增空白模型';
			this.$refs.form.resetFields();
			this.modalVisible = true;
		},
		edit(v) {
			this.modelerUrl = `${this.publicPath}static/modeler.html?modelId=${
				v.modelId
			}&time=${new Date()}`;
			this.showModeler = true;
			this.modelerLoading = false;
			let that = this;
			// 判断iframe是否加载完毕
			let iframe = document.getElementById('iframe');
			if (iframe.attachEvent) {
				iframe.attachEvent('onload', function() {
					//iframe加载完成后你需要进行的操作
					that.modelerLoading = false;
				});
			} else {
				iframe.onload = function() {
					//iframe加载完成后你需要进行的操作
					that.modelerLoading = false;
				};
			}
		},
		handleClose() {
			this.$Modal.confirm({
				title: '确认关闭',
				content: '请记得点击左上角保存按钮，确定关闭编辑器?',
				onOk: () => {
					this.getDataList();
					this.showModeler = false;
				}
			});
		},
		deploy(v) {
			let that = this;
			this.$Modal.confirm({
				title: '确认部署发布',
				content: '您确认要部署发布模型 ' + v.modelName + ' ?',
				loading: true,
				onOk: () => {
					deployModel(v.modelId).then(res => {
						this.$Modal.remove();
						if (res.success) {
							setTimeout(function() {
								that.showJump();
							}, 300);
						}
					});
				}
			});
		},
		showJump() {
			this.$Modal.confirm({
				title: '部署发布成功',
				content:
					'建议立即去分配审批节点人员并编辑流程信息，是否立即跳转查看该流程?',
				onOk: () => {
					this.$router.push({
						name: 'FlowProcess'
					});
				}
			});
		},
		export(v) {
			window.open(exportModel + v.modelId + '?version=' + Date.now());
		},
		remove(v) {
			if (v.delFlag == 1) {
				this.$Msg.warning(v.modelName + '不能删除');
			} else {
				this.$Modal.confirm({
					title: '确认删除',
					content: '您确认要删除 ' + v.modelName + ' ?',
					loading: true,
					onOk: () => {
						deleteModel(v.modelId).then(res => {
							this.$Modal.remove();
							if (res.success) {
								this.$Msg.success('操作成功');
								this.getDataList();
							}
						});
					}
				});
			}
		},
		changeStatus(row, v) {
			if (v == 1) {
				enableModel(row.modelId).then(res => {
					this.loading = false;
					if (res.success) {
						this.$Msg.success('操作成功');
					}
				});
			}
			if (v == 0) {
				disableModel(row.modelId).then(res => {
					this.loading = false;
					if (res.success) {
						this.$Msg.warning('操作成功');
					}
				});
			}
		},
		showSelect(e) {
			this.selectList = e;
			this.selectCount = e.length;
		},
		clearSelectAll() {
			this.$refs.table.selectAll(false);
		},
		delAll() {
			if (this.selectCount <= 0) {
				this.$Msg.warning('您还未选择要删除的数据');
				return;
			}
			this.$Modal.confirm({
				title: '确认删除',
				content: '您确认要删除所选的 ' + this.selectCount + ' 条数据?',
				loading: true,
				onOk: () => {
					let ids = '';
					this.selectList.forEach(function(e) {
						ids += e.id + ',';
					});
					ids = ids.substring(0, ids.length - 1);
					deleteModel(ids).then(res => {
						this.$Modal.remove();
						if (res.success) {
							this.$Msg.success('操作成功');
							this.clearSelectAll();
							this.getDataList();
						}
					});
				}
			});
		}
	},
	mounted() {
		let height = document.documentElement.clientHeight;
		this.fitHeight = Number(height - 287) + 'px';
		this.init();
	},
	watch: {
		$route(to, from) {
			if (to.name == 'model-manage') {
				this.getDataList();
			}
		}
	}
};
</script>