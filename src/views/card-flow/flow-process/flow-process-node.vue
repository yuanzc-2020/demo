<style lang="less">
@import '../../../styles/single-common.less';
@import '../../../styles/table-common.less';
@import '../../../styles/common.less';
</style>
<template>
	<div class="search">
		<SelectUser
			v-if="currView=='user'"
			@close="currView='index'"
			:transferNodeData="transferNodeData"
		/>
		<SelectRole
			v-if="currView=='role'"
			@close="currView='index'"
			:transferNodeData="transferNodeData"
		/>
		<div v-show="currView=='index'">
			<Card>
				<div class="edit-head">
					<a @click="close" class="back-title">
						<Icon type="ios-arrow-back" />返回
					</a>
					<div class="head-name"></div>
					<span></span>
					<a @click="close" class="window-close">
						<Icon type="ios-close" size="31" class="ivu-icon-ios-close" />
					</a>
				</div>
			</Card>
			<Card class="card-margin-top">
				<p slot="title">
					<Icon type="md-list-box" size:18 class="card-title-icon"></Icon>
					{{processName}} 流程节点设置
				</p>
				<Row type="flex" justify="start">
					<Col span="6">
						<Alert show-icon>
							当前选择编辑：
							<span class="select-title">{{editTitle}}</span>
							<a class="select-clear" v-if="form.id" @click="cancelEdit">取消选择</a>
						</Alert>
						<div class="tree-bar">
							<Tree ref="tree" :data="data" :render="renderContent"></Tree>
							<Spin size="large" fix v-if="loading"></Spin>
						</div>
					</Col>
					<Col span="12">
						<Alert type="warning" show-icon style="margin-left: 1vw">温馨提示：若流程运行至未分配审批人员的审批节点时，流程将自动中断取消。</Alert>
						<Form
							ref="form"
							:model="form"
							:label-width="90"
							:rules="formValidate"
							style="position:relative"
						>
							<FormItem label="节点名称" prop="title">{{form.title}}</FormItem>
							<Form-item label="节点类型" prop="type">
								<Select v-model="form.type" disabled placeholder>
									<Option v-for="(item, i) in dictNodeType" :key="i" :value="item.value">{{item.title}}</Option>
								</Select>
							</Form-item>
							<div v-show="form.type==1">
								<FormItem label="授权角色">
									<Button type="dashed" icon="md-git-merge" @click="handleSelectRole">授权审批角色</Button>
								</FormItem>
								<FormItem label="授权用户">
									<Button type="dashed" icon="md-contacts" @click="handleSelectUser">授权审批用户</Button>
								</FormItem>
							</div>
						</Form>
					</Col>
				</Row>
			</Card>
		</div>
	</div>
</template>

<script>
import { getProcessNode, nodeUpdate } from '@/api/card-flow-api';
import SelectUser from '@/views/card-flow/flow-process/flow-process-node-user';
import SelectRole from '@/views/card-flow/flow-process/flow-process-node-role';

export default {
	components: { SelectUser, SelectRole },
	props: {
		transferData: Array
	},
	data() {
		return {
			loading: false,
			nodeLoading: false,
			data: [],
			currView: 'index',
			transferNodeData: {},
			editTitle: '',
			selectUsers: [],
			selectRoles: [],
			userModalVisible: false,
			modalTitle: '',
			form: {
				title: '',
				content: '',
				type: null
			},
			roleList: [],
			formValidate: {},
			submitLoading: false,
			chooseRole: false,
			chooseUser: false,
			dictNodeType: [
				{
					id: '10',
					title: '开始节点',
					value: '0'
				},
				{
					id: '11',
					title: '审批节点',
					value: '1'
				},
				{
					id: '12',
					title: '结束节点',
					value: '2'
				}
			],
			backRoute: '',
			processName: '',
			processId: '',
			processNodeId: '',
			processNodeName: ''
		};
	},
	methods: {
		init() {
			this.processId = this.transferData.procDefId;
			this.processName = this.transferData.name;
			this.getData();
		},
		getData() {
			this.loading = true;
			getProcessNode(this.processId).then(res => {
				this.loading = false;
				if (res.success) {
					let v = res.result;
					for (let attr in v) {
						if (v[attr] == null) {
							v[attr] = '';
						}
					}
					let str = JSON.stringify(v);
					let data = JSON.parse(str);
					data.forEach(e => {
						this.dictNodeType.forEach(t => {
							t.value = Number(t.value);
							if (!e.title && e.type == t.value) {
								e.title = t.title;
							}
						});
					});
					this.data = data;
				}
			});
		},
		renderContent(h, { root, node, data }) {
			let color = '',
				word = '';
			if (data.type == 0) {
				color = '#47cb89';
				word = '开';
			} else if (data.type == 1) {
				color = '#2db7f5';
				word = '审';
			} else if (data.type == 2) {
				word = '结';
			} else {
				color = '#f90';
				word = '其他';
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
						h(
							'Avatar',
							{
								props: {
									size: 'small'
								},
								style: {
									background: color,
									'margin-right': '5px'
								}
							},
							word
						),
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
		selectTree(v) {
			if (v && v.id != this.form.id) {
				for (let attr in v) {
					if (v[attr] == null) {
						v[attr] = '';
					}
				}
				let str = JSON.stringify(v);
				let data = JSON.parse(str);
				this.editTitle = data.title;
				this.processNodeId = data.id;
				this.processNodeName = data.title;
				this.form = data;
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
		handleSelectUser() {
			let data = [];
			data.processId = this.processId;
			data.processName = this.processName;
			data.processNodeId = this.processNodeId;
			data.processNodeName = this.processNodeName;
			this.transferNodeData = data;
			this.currView = 'user';
		},
		handleSelectRole() {
			let data = [];
			data.processId = this.processId;
			data.processName = this.processName;
			data.processNodeId = this.processNodeId;
			data.processNodeName = this.processNodeName;
			this.transferNodeData = data;
			this.currView = 'role';
		},
		close() {
			this.$emit('close', true);
		},
		submited() {
			this.$emit('submited', true);
		}
	},
	mounted() {
		this.init();
	},
	watch: {}
};
</script>