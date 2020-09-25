<style lang="less">
@import '../../../styles/table-common.less';
</style>
<template>
	<div class="search">
		<ProcessNode
			v-if="currView=='process_node'"
			@close="currView='index'"
			:transferData="transferData"
			@submited="submited"
		/>
		<Card v-show="currView=='index'">
			<Row v-show="openSearch" @keydown.enter.native="handleSearch">
				<Form ref="searchForm" :model="searchForm" inline :label-width="100">
					<Form-item label="流程名称" prop="name">
						<Input
							type="text"
							v-model="searchForm.name"
							placeholder="请输入流程名称"
							clearable
							style="width: 200px"
						/>
					</Form-item>
					<Form-item label="标识Key" prop="procDefKey">
						<Input
							type="text"
							v-model="searchForm.procDefKey"
							placeholder="请输入标识Key"
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
				<Button @click="deploy" type="primary" icon="md-cloud-upload">部署流程文件</Button>
				<Button type="dashed" @click="getDataList">刷新数据</Button>
				<Button type="dashed" @click="openSearch=!openSearch">{{openSearch ? "关闭搜索" : "开启搜索"}}</Button>
				<Button type="dashed" @click="openTip=!openTip">{{openTip ? "关闭提示" : "开启提示"}}</Button>
				<i-switch
					size="large"
					v-model="searchForm.showLatest"
					@on-change="getDataList"
					style="margin:0 5px"
				>
					<span slot="open">最新</span>
					<span slot="close">全部</span>
				</i-switch>
			</Row>
			<Row v-show="openTip">
				<Alert show-icon>
					已选择数据
					<span class="select-count">{{selectCount}}</span> 项
					<a class="select-clear" @click="clearSelectAll">清空</a>
					<span style="margin-left:20px">说明：当有多个相同标识的流程时，默认仅显示其最新版本</span>
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

		<!-- 部署流程文件 -->
		<Modal title="部署流程文件" footer-hide v-model="modalVisible" :mask-closable="false" :width="500">
			<Upload
				:action="deployByFileUrl"
				:headers="accessToken"
				:on-success="handleSuccess"
				:on-error="handleError"
				:format="['zip','bar','bpmn','xml']"
				:max-size="5120"
				:on-format-error="handleFormatError"
				:on-exceeded-size="handleMaxSize"
				type="drag"
				ref="up"
			>
				<div style="padding: 20px 0">
					<Icon type="ios-cloud-upload" size="52" style="color: #3399ff"></Icon>
					<p>点击这里或将文件拖拽到这里上传</p>请选择BPMN文件，仅支持zip、bpmn20.xml、bar、bpmn格式文件
				</div>
			</Upload>
		</Modal>
		<!-- 编辑分类或备注 -->
		<Modal title="编辑流程" v-model="editModalVisible" :mask-closable="false" :width="500">
			<Form ref="form" :model="form" :label-width="110" :rules="formValidate">
				<FormItem label="流程分类" prop="categoryId">
					<Select v-model="form.categoryId" placeholder="请选择" clearable>
						<Option v-for="(item, i) in flowCategorys" :key="i" :value="item.id" :label="item.title">
							<span style="margin-right:10px;">{{ item.title }}</span>
							<span style="color:#ccc;">{{ item.id }}</span>
						</Option>
					</Select>
				</FormItem>
				<FormItem label="流程名称" prop="name">
					<Input v-model="form.name" />
				</FormItem>
				<FormItem label="业务标识" prop="businessCode">
					<Input v-model="form.businessCode" />
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
				<Button type="text" @click="editModalVisible=false">取消</Button>
				<Button type="primary" :loading="submitLoading" @click="handelSubmitEdit">提交</Button>
			</div>
		</Modal>
		<!-- 图片预览 -->
		<Modal :title="viewTitle" v-model="viewImage" draggable width="800">
			<img :src="diagramUrl" alt="无效的图片链接" style="width: 100%;margin: 0 auto;display: block;" />
			<div slot="footer">
				<Button @click="viewImage=false" style="margin-right:5px">关闭</Button>
				<Button :to="diagramUrl" target="_blank" type="primary">下载</Button>
			</div>
		</Modal>
	</div>
</template>

<script>
import {
	getCategoryList,
	getProcessList,
	updateProcess,
	deleteProcess,
	disableProcess,
	enableProcess,
	getProcessNode,
	nodeUpdate,
	deployByFile,
	exportResource,
	convertToModel
} from '@/api/card-flow-api';
import ProcessNode from './flow-process-node.vue';
export default {
	name: 'FlowProcess',
	components: {
		ProcessNode
	},
	data() {
		return {
			currView: 'index',
			openSearch: true,
			openTip: true,
			accessToken: {},
			deployByFileUrl: '',
			loading: true,
			selectCount: 0,
			selectList: [],
			viewImage: false,
			viewTitle: '流程图片预览',
			diagramUrl: '',
			searchForm: {
				showLatest: true,
				name: '',
				procDefKey: '',
				pageNumber: 1,
				pageSize: 10
			},
			modalVisible: false,
			editModalVisible: false,
			dataCat: [],
			catLoading: false,
			searchKey: '',
			form: {
				categoryId: '',
				name: '',
				routeName: '',
				businessCode: '',
				description: ''
			},
			formValidate: {
				name: [
					{ required: true, message: '不能为空', trigger: 'blur' }
				],
				businessCode: [
					{ required: true, message: '不能为空', trigger: 'blur' }
				]
			},
			categoryTitle: '',
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
					minWidth: 140
				},
				{
					title: '流程名称',
					key: 'name',
					align: 'center',
					minWidth: 140
				},
				{
					title: '流程标识',
					key: 'procDefKey',
					align: 'center',
					minWidth: 150
				},
				{
					title: '流程状态',
					key: 'statusCode',
					align: 'center',
					minWidth: 100,
					render: (h, params) => {
						if (params.row.statusCode == 1) {
							return h('div', [
								h('Badge', {
									props: {
										status: 'success',
										text: '已激活'
									}
								})
							]);
						} else if (params.row.statusCode == 0) {
							return h('div', [
								h('Badge', {
									props: {
										status: 'error',
										text: '已挂起'
									}
								})
							]);
						}
					}
				},
				{
					title: '版本',
					key: 'version',
					minWidth: 90,
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
					title: '流程图片',
					key: 'diagramName',
					minWidth: 180,
					tooltip: true,
					render: (h, params) => {
						return h('div', [
							h(
								'a',
								{
									on: {
										click: () => {
											this.showResource(1, params.row);
										}
									}
								},
								params.row.diagramName
							)
						]);
					}
				},
				{
					title: '流程XML',
					key: 'xmlName',
					minWidth: 180,
					tooltip: true,
					render: (h, params) => {
						return h('div', [
							h(
								'a',
								{
									on: {
										click: () => {
											this.showResource(0, params.row);
										}
									}
								},
								params.row.xmlName
							)
						]);
					}
				},
				{
					title: '操作',
					key: 'action',
					minWidth: 365,
					align: 'center',
					render: (h, params) => {
						let suspendOrActive = '';
						if (params.row.statusCode == 0) {
							// 挂起可激活
							suspendOrActive = h(
								'Button',
								{
									props: {
										type: 'success',
										size: 'small',
										icon: 'md-play'
									},
									style: {
										marginRight: '5px'
									},
									on: {
										click: () => {
											this.editStatus(1, params.row);
										}
									}
								},
								'激活'
							);
						} else {
							// 激活可挂起
							suspendOrActive = h(
								'Button',
								{
									props: {
										type: 'warning',
										size: 'small',
										icon: 'md-pause'
									},
									style: {
										marginRight: '5px'
									},
									on: {
										click: () => {
											this.editStatus(0, params.row);
										}
									}
								},
								'挂起'
							);
						}
						return h('div', [
							suspendOrActive,
							h(
								'Button',
								{
									props: {
										type: 'primary',
										size: 'small',
										icon: 'logo-buffer'
									},
									style: {
										marginRight: '5px'
									},
									on: {
										click: () => {
											this.editNode(params.row);
										}
									}
								},
								'节点设置'
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
											this.edit(params.row);
										}
									}
								},
								'编辑'
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
											this.convert(params.row);
										}
									}
								},
								'转模型'
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
					title: '描述',
					key: 'description',
					minWidth: 150
				},
				{
					title: '部署时间',
					key: 'addTime',
					align: 'center',
					minWidth: 160
				},
				{
					title: '更新时间',
					key: 'updateTime',
					align: 'center',
					minWidth: 160
				}
			],
			data: [],
			total: 0,
			dictTable: [],
			dictForm: [],
			flowCategorys: []
		};
	},
	methods: {
		init() {
			this.accessToken = {
				accessToken: this.getCookieStore('loginSessionId')
			};
			this.deployByFileUrl = deployByFile;
			this.getDataList();
			this.getCatrgoryList();
		},
		submited() {
			this.currView = 'index';
			this.getDataList();
		},
		renderContent(h, { root, node, data }) {
			let icon = '';
			if (data.type == '0') {
				icon = 'md-folder-open';
			} else if (data.type == '1') {
				icon = 'ios-bookmark-outline';
			}
			return h(
				'span',
				{
					style: {
						display: 'inline-block',
						cursor: 'pointer'
					},
					on: {
						click: () => {
							this.selectTree(data);
						}
					}
				},
				[
					h('span', [
						h('Icon', {
							props: {
								type: icon,
								size: '16'
							},
							style: {
								'margin-right': '8px',
								'margin-bottom': '3px'
							}
						}),
						h('span', data.title)
					])
				]
			);
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
		getCatrgoryList() {
			getCategoryList({
				categoryType: 1,
				pageNumber: 1,
				pageSize: 9999
			}).then(res => {
				this.loading = false;
				if (res.success) {
					this.flowCategorys = res.result.content;
				}
			});
		},
		getDataList() {
			this.loading = true;
			getProcessList(this.searchForm).then(res => {
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
		deploy(v) {
			this.modalVisible = true;
		},
		handleFormatError(file) {
			this.$Notice.warning({
				title: '不支持的文件格式',
				desc:
					'所选文件‘ ' +
					file.name +
					' ’格式不正确, 请选择 .zip .bar .bpmn .bpmn20.xml格式文件'
			});
		},
		handleMaxSize(file) {
			this.$Notice.warning({
				title: '文件大小过大',
				desc: '所选文件‘ ' + file.name + ' ’大小过大, 不得超过 5M.'
			});
		},
		handleSuccess(res, file) {
			if (res.success) {
				this.$Msg.success('部署成功，请继续编辑完善流程信息');
				this.modalVisible = false;
				this.getDataList();
			} else {
				this.$Msg.error(res.message);
			}
		},
		handleError(error, file, fileList) {
			this.$Msg.error(error.toString());
		},
		edit(v) {
			this.$refs.form.resetFields();
			for (let attr in v) {
				if (v[attr] == null) {
					v[attr] = '';
				}
			}
			let str = JSON.stringify(v);
			let data = JSON.parse(str);
			this.form = data;
			this.categoryTitle = data.categoryName;
			this.editModalVisible = true;
		},
		editNode(v) {
			let data = [];
			data.procDefId = v.procDefId;
			data.name = v.name;
			this.transferData = data;
			this.currView = 'process_node';
		},
		handelSubmitEdit() {
			this.$refs.form.validate(valid => {
				if (valid) {
					this.submitLoading = true;
					updateProcess(this.form).then(res => {
						this.submitLoading = false;
						if (res.success) {
							this.$Msg.success('操作成功');
							this.getDataList();
							this.editModalVisible = false;
						}
					});
				}
			});
		},
		editStatus(status, v) {
			let operation = '';
			if (status == 0) {
				operation = '暂停挂起';
			} else {
				operation = '激活运行';
			}
			this.$Modal.confirm({
				title: '确认' + operation,
				content: `您确认要${operation}流程${v.name}?`,
				loading: true,
				onOk: () => {
					if (status == 1) {
						enableProcess(v.procDefId).then(res => {
							this.$Modal.remove();
							this.loading = false;
							if (res.success) {
								this.$Msg.success('操作成功');
								this.getDataList();
							}
						});
					}
					if (status == 0) {
						disableProcess(v.procDefId).then(res => {
							this.$Modal.remove();
							this.loading = false;
							if (res.success) {
								this.$Msg.warning('操作成功');
								this.getDataList();
							}
						});
					}
				}
			});
		},
		convert(v) {
			let that = this;
			this.$Modal.confirm({
				title: '确认转化',
				content: '您确认要转化流程 ' + v.name + ' 为模型?',
				loading: true,
				onOk: () => {
					convertToModel(v.procDefId).then(res => {
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
				title: '转化成功',
				content: '是否立即跳转查看该模型?',
				onOk: () => {
					this.$router.push({
						name: 'flow-model'
					});
				}
			});
		},
		showResource(type, v) {
			if (type == 0) {
				window.open(
					`${exportResource}?procDefId=${v.procDefId}&type=${type}`
				);
			} else if (type == 1) {
				this.viewTitle = '流程图片预览(' + v.diagramName + ')';
				this.diagramUrl = `${exportResource}?procDefId=${v.procDefId}&type=${type}`;
				this.viewImage = true;
			}
		},
		remove(v) {
			if (v.delFlag == 1) {
				this.$Msg.warning(v.name + '不能删除');
			} else {
				this.$Modal.confirm({
					title: '确认删除',
					content: '您确认要删除流程 ' + v.name + ' ?',
					loading: true,
					onOk: () => {
						deleteProcess(v.procDefId).then(res => {
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
					this.$Msg.success('不能删除');
					this.clearSelectAll();
					this.getDataList();
				}
			});
		}
	},
	mounted() {
		this.init();
	},
	watch: {
		$route(to, from) {
			if (to.name == 'process-manage') {
				this.getDataList();
			}
		}
	}
};
</script>