<style lang="less">
@import '../../../styles/tree-common.less';
</style>
<template>
	<div class="search">
		<Card>
			<Row class="operation">
				<Button @click="addRoot" type="primary" icon="md-add">新增流程分组</Button>
				<Button @click="add" icon="md-add">新增流程分类</Button>
				<Button type="dashed" @click="delAll" icon="md-trash">批量删除</Button>
				<Button type="dashed" @click="getParentList">刷新数据</Button>
				<i-switch v-model="strict" size="large" style="margin-left:5px">
					<span slot="open">级联</span>
					<span slot="close">单选</span>
				</i-switch>
			</Row>
			<Row type="flex" justify="start">
				<Col :md="8" :lg="8" :xl="6">
					<Alert show-icon>
						当前选择编辑：
						<span class="select-title">{{editTitle}}</span>
						<a class="select-clear" v-if="form.id" @click="cancelEdit">取消选择</a>
					</Alert>
					<div class="tree-bar" :style="{minHeight: fitHeight}">
						<Tree
							ref="tree"
							:data="data"
							:render="renderContent"
							show-checkbox
							@on-check-change="changeSelect"
							:check-strictly="!strict"
						></Tree>
						<Spin size="large" fix v-if="loading"></Spin>
					</div>
				</Col>
				<Col :md="15" :lg="13" :xl="9" style="margin-left:10px;">
					<Form ref="form" :model="form" :label-width="100" :rules="formValidate">
						<FormItem label="类别名称" prop="title">
							<Input v-model="form.title" />
						</FormItem>
						<FormItem label="是否启用" prop="statusCode">
							<i-switch size="large" v-model="form.statusCode" :true-value="0" :false-value="-1">
								<span slot="open">启用</span>
								<span slot="close">禁用</span>
							</i-switch>
						</FormItem>
						<Form-item>
							<Button
								style="margin-right:5px"
								@click="submitEdit"
								:loading="submitLoading"
								type="primary"
								icon="ios-create-outline"
							>修改并保存</Button>
							<Button @click="handleReset">重置</Button>
						</Form-item>
					</Form>
				</Col>
			</Row>
		</Card>

		<Modal :title="modalTitle" v-model="modalVisible" :mask-closable="false" :width="500">
			<Form ref="formAdd" :model="formAdd" :label-width="85" :rules="formValidate">
				<div v-if="showParent">
					<FormItem label="上级节点：">{{form.title}}</FormItem>
				</div>
				<FormItem label="类别名称" prop="title">
					<Input v-model="formAdd.title" />
				</FormItem>
				<FormItem label="是否启用" prop="statusCode">
					<i-switch size="large" v-model="formAdd.statusCode" :true-value="1" :false-value="0">
						<span slot="open">启用</span>
						<span slot="close">禁用</span>
					</i-switch>
				</FormItem>
			</Form>
			<div slot="footer">
				<Button type="text" @click="cancelAdd">取消</Button>
				<Button type="primary" :loading="submitLoading" @click="submitAdd">提交</Button>
			</div>
		</Modal>
	</div>
</template>

<script>
import {
	getCategoryList,
	insertCategory,
	updateCategory,
	deleteCategory
} from '@/api/card-flow-api';
export default {
	data() {
		return {
			strict: true,
			loading: true,
			loadingEdit: true,
			modalVisible: false,
			selectList: [],
			fitHeight: '500px',
			selectCount: 0,
			defCategory: 0,
			showParent: false,
			modalTitle: '',
			editTitle: '',
			form: {
				id: '',
				title: '',
				categoryType: 1,
				statusCode: 0
			},
			formAdd: {
				categoryType: 0
			},
			formValidate: {
				title: [
					{ required: true, message: '名称不能为空', trigger: 'blur' }
				],
				type: [
					{ required: true, message: '类型不能为空', trigger: 'blur' }
				]
			},
			submitLoading: false,
			data: [],
			dataEdit: []
		};
	},
	methods: {
		init() {
			this.getParentList();
		},
		renderContent(h, { root, node, data }) {
			let icon = '';
			if (data.categoryType == '0') {
				icon = 'md-list-box';
			} else if (data.categoryType == '1') {
				icon = 'md-list';
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
						h(
							'span',
							{
								class: {
									'ivu-tree-title': true,
									'ivu-tree-title-selected':
										data.id == this.form.id
								}
							},
							data.title
						)
					])
				]
			);
		},
		getParentList() {
			this.loading = true;
			getCategoryList({
				pageNumber: 1,
				pageSize: 1000
			}).then(res => {
				this.loading = false;
				if (res.success) {
					let tempDatas = [];
					res.result.content.forEach(e => {
						let item = {
							id: e.id,
							pid: e.pid,
							title: e.title,
							statusCode: e.statusCode,
							categoryType: e.categoryType,
							expand: e.categoryType == 0
						};
						tempDatas.push(item);
					});
					let treeData = this.globalUtil.listConvertTreeData(
						tempDatas,
						'id',
						'pid',
						'children'
					);
					this.data = treeData;
				}
			});
		},
		selectTree(v) {
			if (v && v.id != this.form.id) {
				for (let attr in v) {
					if (v[attr] == null) {
						v[attr] = '';
					}
				}
				let str = JSON.stringify(v);
				let data = JSON.parse(str);
				this.form = data;
				this.editTitle = data.title;
			} else {
				this.cancelEdit();
			}
		},
		cancelEdit() {
			let data = this.$refs.tree.getSelectedNodes()[0];
			if (data) {
				data.selected = false;
			}
			this.$refs.form.resetFields();
			this.form.id = '';
			delete this.form.id;
			this.editTitle = '';
		},
		cancelAdd() {
			this.modalVisible = false;
		},
		handleReset() {
			this.$refs.form.resetFields();
			this.form.statusCode = 0;
		},
		submitEdit() {
			this.$refs.form.validate(valid => {
				if (valid) {
					if (!this.form.id) {
						this.$Msg.warning('请先点击选择要修改的节点');
						return;
					}
					this.submitLoading = true;
					updateCategory(this.form).then(res => {
						this.submitLoading = false;
						if (res.success) {
							this.$Msg.success('编辑成功');
							this.init();
							this.modalVisible = false;
						}
					});
				}
			});
		},
		submitAdd() {
			this.$refs.formAdd.validate(valid => {
				if (valid) {
					this.submitLoading = true;
					insertCategory(this.formAdd).then(res => {
						this.submitLoading = false;
						if (res.success) {
							this.$Msg.success('新增成功');
							this.init();
							this.modalVisible = false;
						}
					});
				}
			});
		},
		add() {
			if (this.form.id == '' || this.form.id == null) {
				this.$Msg.warning('请先点击选择类别节点');
				return;
			}
			if (this.form.categoryType == 1) {
				this.$Msg.warning('请先点击选择类别节点');
				return;
			}
			this.modalTitle = '新增流程分类';
			this.showParent = true;
			this.formAdd = {
				pid: this.form.id,
				statusCode: 1,
				categoryType: 1
			};
			this.modalVisible = true;
		},
		addRoot() {
			this.modalTitle = '新增流程分组';
			this.showParent = false;
			this.formAdd = {
				pid: 0,
				statusCode: 1,
				categoryType: 0
			};
			this.defCategory = -1;
			this.modalVisible = true;
		},
		changeSelect(v) {
			this.selectCount = v.length;
			this.selectList = v;
		},
		delAll() {
			if (this.selectCount <= 0) {
				this.$Msg.warning('您还未勾选要删除的数据');
				return;
			}
			this.$Modal.confirm({
				title: '确认删除',
				content:
					'您确认要删除所选的 ' +
					this.selectCount +
					' 条数据及其下级所有数据?',
				loading: true,
				onOk: () => {
					let para = [];
					this.selectList.forEach(function(e) {
						para.push(e.id);
					});
					deleteCategory({ ids: para }).then(res => {
						this.$Modal.remove();
						if (res.success) {
							this.$Msg.success('删除成功');
							this.selectList = [];
							this.selectCount = 0;
							this.cancelEdit();
							this.init();
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
	}
};
</script>