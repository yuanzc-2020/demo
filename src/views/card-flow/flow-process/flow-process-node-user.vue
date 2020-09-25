 <style lang="less">
@import '../../../styles/single-common.less';
@import '../../../styles/tree&table-common.less';
@import '../../../styles/common.less';
</style>
<template>
	<div>
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
				流程名称：{{processName}} 流程节点：{{processNodeName}}
			</p>
			<Row class="search" type="flex" :gutter="16" justify="left">
				<Col span="6">
					<Card dis-hover>
						<p slot="title">公司组织</p>
						<!-- <Input
							v-model="searchKey"
							suffix="ios-search"
							@on-change="search"
							placeholder="请输入搜索关键字"
							clearable
						/>-->
						<div class="tree-bar" style="height:380px">
							<!--公司树形-->
							<Tree ref="tree" :data="treeData" :render="renderContent"></Tree>
							<Spin size="large" fix v-if="treeLoading"></Spin>
						</div>
					</Card>
				</Col>
				<Col span="8">
					<Card dis-hover>
						<p slot="title">待选择公司用户</p>
						<div class="tree-bar" style="height:380px;">
							<!--树形-->
							<Tree ref="treeUser" :data="treeDataUser" :render="renderContent1"></Tree>
							<Spin size="large" fix v-if="treeLoading1"></Spin>
						</div>
					</Card>
				</Col>
				<Col span="8">
					<Card dis-hover>
						<p slot="title">已授权审批用户</p>
						<div class="tree-bar" style="height:380px;">
							<!--树形-->
							<Tree
								ref="treeUserSelect"
								:data="treeDataUserSelect"
								@on-check-change="removeRelate"
								show-checkbox
								:render="renderContent2"
							></Tree>
							<Spin size="large" fix v-if="treeLoading2"></Spin>
						</div>
					</Card>
				</Col>
			</Row>
		</Card>
	</div>
</template>

<script>
import {
	nodeRelateList,
	nodeRelateInsert,
	nodeRelateRemove
} from '@/api/card-flow-api';
import { getUserList } from '@/api/card-system-api';
export default {
	props: {
		transferNodeData: Array
	},
	data() {
		return {
			treeLoading: false,
			treeLoading1: false,
			treeLoading2: false,
			searchKey: '',
			searchKeyUser: '',
			searchKeyUserSelect: '',
			treeData: [],
			treeDataUser: [],
			treeDataUserSelect: [],
			selectTreeCorpId: '',
			selectTreeCorpName: '',
			processId: '',
			processName: '',
			processNodeId: '',
			processNodeName: ''
		};
	},
	methods: {
		init() {
			this.processId = this.transferNodeData.processId;
			this.processName = this.transferNodeData.processName;
			this.processNodeId = this.transferNodeData.processNodeId;
			this.processNodeName = this.transferNodeData.processNodeName;
			this.getTreeList();
		},
		getTreeList() {
			this.treeLoading = true;
			this.handleAuthcMethods.getBaseAllEnableCorpTree().then(res => {
				this.treeData = res;
				this.treeLoading = false;
			});
		},
		renderContent(h, { root, node, data }) {
			let icon = '';
			icon = 'md-list-box';
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
								color:
									data.statusCode == 1
										? '#2d8cf0'
										: '#515a6e',
								'margin-right': '8px',
								'margin-bottom': '3px'
							}
						}),
						h(
							'span',
							{
								class: {
									'ivu-tree-title': true,
									'ivu-tree-title-selected': false
								}
							},
							data.title
						)
					])
				]
			);
		},
		renderContent1(h, { root, node, data }) {
			let icon = '';
			icon = 'md-list-box';
			return h(
				'span',
				{
					style: {
						display: 'inline-block',
						cursor: 'pointer'
					},
					on: {
						click: () => {
							this.selectTreeUser(data);
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
								color: '#2d8cf0',
								'margin-right': '8px',
								'margin-bottom': '3px'
							}
						}),
						h('span', data.title)
					])
				]
			);
		},
		renderContent2(h, { root, node, data }) {
			let icon = '';
			icon = 'md-list-box';
			return h(
				'span',
				{
					style: {
						display: 'inline-block',
						cursor: 'pointer'
					},
					on: {}
				},
				[
					h('span', [
						h('Icon', {
							props: {
								type: icon,
								size: '16'
							},
							style: {
								color: '#2d8cf0',
								'margin-right': '8px',
								'margin-bottom': '3px'
							}
						}),
						h('span', data.title)
					])
				]
			);
		},
		search() {
			if (this.searchKey) {
				this.treeLoading = true;
				this.handleAuthcMethods
					.getBaseAllEnableCorpTreeSearch(this.searchKey)
					.then(res => {
						this.treeData = res;
						this.treeLoading = false;
					});
			} else {
				this.getTreeList();
			}
		},
		getNodeRelateList() {
			this.treeLoading2 = true;
			let paras = {
				nodeId: this.processNodeId,
				type: 1,
				relateCorpId: this.selectTreeCorpId,
				pageNumber: 1,
				pageSize: 10000
			};
			nodeRelateList(paras).then(res => {
				if (res.success) {
					let rst = res.result.content;
					if (rst != null) {
						let tempDatas = [];
						rst.forEach(e => {
							let item = {
								id: e.id,
								title:
									e.relateId +
									'_' +
									e.relateName +
									'[' +
									e.relateCorpName +
									']',
								relateId: e.relateId,
								relateCorpId: e.relateCorpId,
								checked: true
							};
							tempDatas.push(item);
						});
						this.treeDataUserSelect = tempDatas;
					}
					this.treeLoading2 = false;
				}
			});
		},
		getDataUserList() {
			this.treeLoading1 = true;
			let paras = {
				corpId: this.selectTreeCorpId,
				statusCode: 1,
				pageNumber: 1,
				pageSize: 10000
			};
			getUserList(paras).then(res => {
				this.loading = false;
				if (res.success) {
					let rst = res.result.content;
					if (rst != null) {
						let tempDatas = [];
						rst.forEach(e => {
							let item = {
								id: e.userId,
								title: e.userId + '_' + e.userName,
								corpId: e.corpId,
								accountId: e.accountId,
								disabled: e.statusCode == 0,
								checked: false
							};
							tempDatas.push(item);
						});
						this.treeDataUser = tempDatas;
					}
					this.treeLoading1 = false;
				}
			});
		},
		selectTree(v) {
			if (v) {
				this.selectTreeCorpId = v.id;
				this.selectTreeCorpName = v.title;
				this.getNodeRelateList();
				this.getDataUserList();
			} else {
				this.treeDataUserSelect = [];
				this.treeDataUser = [];
				this.selectTreeCorpId = '';
				this.selectTreeCorpName = '';
			}
		},
		selectTreeUser(v) {
			if (v) {
				let paras = {
					nodeId: this.processNodeId,
					proDefId: this.processId,
					relateCorpId: v.corpId,
					relateId: v.id,
					type: 1
				};
				nodeRelateInsert(paras).then(res => {
					if (res.success) {
						if (res.result == 0) {
							this.$Msg.success(v.title + '新增成功');
							this.getNodeRelateList();
						}
						if (res.result == -1) {
							this.$Msg.warning('请勿重复选择新增');
						}
					}
				});
			}
		},
		removeRelate(v, item) {
			if (item) {
				nodeRelateRemove(item.id).then(res => {
					if (res.success) {
						this.$Msg.success(item.title + '移除成功');
						this.getNodeRelateList();
					}
				});
			}
		},
		close() {
			this.$emit('close', true);
		}
	},
	mounted() {
		this.init();
	}
};
</script>